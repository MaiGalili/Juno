// repositories/taskRepo.js
const db = require("../db");

//async function assignFromWaiting(req, res) {}
async function getAssignedBetween(email, startDate, endDate) {
  const [rows] = await db.promise().query(
    `
    SELECT t.task_id, a.task_start_date, a.task_end_date,
           a.task_start_time, a.task_end_time
    FROM assigned a
    JOIN task t ON t.task_id = a.task_id
    WHERE t.email = ?
      AND a.task_start_date >= ?
      AND a.task_start_date <= ?
    ORDER BY a.task_start_date, a.task_start_time
    `,
    [email, startDate, endDate]
  );
  return rows;
}

async function getWaitingById(waitingId, email) {
  const [rows] = await db.promise().query(
    `SELECT t.*,
      w.task_duedate, w.task_duetime,
      GROUP_CONCAT(tc.category_id) AS category_ids_csv
    FROM task t
    JOIN waiting_list w ON w.task_id = t.task_id
    LEFT JOIN task_category tc ON tc.task_id = t.task_id
    WHERE t.task_id = ? AND t.email = ?
    GROUP BY t.task_id`,
    [waitingId, email]
  );
  const row = rows[0];
  if (!row) return null;
  // parse CSV -> array<number>
  row.category_ids = row.category_ids_csv
    ? row.category_ids_csv.split(",").map((x) => Number(x))
    : [];
  return row;
}

async function createAssignedTaskTx(conn, payload) {
  const [insTask] = await conn.query(
    `INSERT INTO task
      (task_title, task_duration, task_note, task_buffertime, location_id,
       custom_location_address, custom_location_latitude, custom_location_longitude,
       task_all_day, task_repeat, repeat_until, email, series_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'none', NULL, ?, NULL)`,
    [
      payload.title,
      payload.duration,
      payload.note,
      payload.buffer_time,
      payload.location_id,
      payload.custom_location_address,
      payload.custom_location_latitude,
      payload.custom_location_longitude,
      payload.user_email,
    ]
  );
  const newTaskId = insTask.insertId;

  await conn.query(
    `INSERT INTO assigned
       (task_id, task_start_date, task_end_date, task_start_time, task_end_time)
     VALUES (?, ?, ?, ?, ?)`,
    [
      newTaskId,
      payload.start_date,
      payload.end_date,
      payload.start_time,
      payload.end_time,
    ]
  );

  if (Array.isArray(payload.category_ids)) {
    for (const cid of payload.category_ids) {
      await conn.query(
        `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
        [newTaskId, cid]
      );
    }
  }

  return { task_id: newTaskId };
}

async function promoteWaitingToAssigned(waitingId, payload) {
  const conn = db.promise();
  try {
    await conn.beginTransaction();

    const created = await createAssignedTaskTx(conn, payload);

    // Delete the old waiting task by removing the row from `task`.
    await conn.query(`DELETE FROM task WHERE task_id = ? AND email = ?`, [
      waitingId,
      payload.user_email,
    ]);

    await conn.commit();
    return created;
  } catch (e) {
    await conn.rollback();
    throw e;
  }
}

// Get an assigned task by id + email (used to verify ownership / preload values)
async function getAssignedById(assignedId, email) {
  const [rows] = await db.promise().query(
    `SELECT t.*,
            a.task_start_date, a.task_end_date, a.task_start_time, a.task_end_time,
            GROUP_CONCAT(tc.category_id) AS category_ids_csv
     FROM task t
     JOIN assigned a ON a.task_id = t.task_id
     LEFT JOIN task_category tc ON tc.task_id = t.task_id
     WHERE t.task_id = ? AND t.email = ?
     GROUP BY t.task_id`,
    [assignedId, email]
  );
  const row = rows[0];
  if (!row) return null;
  row.category_ids = row.category_ids_csv
    ? row.category_ids_csv.split(",").map((x) => Number(x))
    : [];
  return row;
}

// Create a waiting task inside an existing transaction-like "conn"
async function createWaitingTaskTx(conn, payload) {
  // Insert a new base task row (no assigned rows for waiting tasks)
  const [insTask] = await conn.query(
    `INSERT INTO task
       (task_title, task_duration, task_note, task_buffertime, location_id,
        custom_location_address, custom_location_latitude, custom_location_longitude,
        email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.title,
      payload.duration,
      payload.note,
      payload.buffer_time, // should already be HH:MM:SS or null
      payload.location_id,
      payload.custom_location_address,
      payload.custom_location_latitude,
      payload.custom_location_longitude,
      payload.user_email,
    ]
  );
  const newTaskId = insTask.insertId;

  // Insert the waiting_list row (due date/time)
  await conn.query(
    `INSERT INTO waiting_list (task_id, task_duedate, task_duetime)
     VALUES (?, ?, ?)`,
    [newTaskId, payload.due_date, payload.due_time]
  );

  // Copy categories if provided
  if (Array.isArray(payload.category_ids)) {
    for (const cid of payload.category_ids) {
      await conn.query(
        `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
        [newTaskId, cid]
      );
    }
  }

  return { task_id: newTaskId };
}

// Demote an assigned task to a waiting task in a single transaction
async function demoteAssignedToWaiting(assignedId, payload) {
  const conn = db.promise();
  try {
    await conn.beginTransaction();

    // Create the new waiting task
    const created = await createWaitingTaskTx(conn, payload);

    // Delete the original (assigned) task row; child 'assigned' row is removed via FK CASCADE
    await conn.query(`DELETE FROM task WHERE task_id = ? AND email = ?`, [
      assignedId,
      payload.user_email,
    ]);

    await conn.commit();
    return created;
  } catch (e) {
    await conn.rollback();
    throw e;
  }
}


module.exports = {
  getAssignedBetween,
  getWaitingById,
  promoteWaitingToAssigned,
  getAssignedById,
  demoteAssignedToWaiting,
};
