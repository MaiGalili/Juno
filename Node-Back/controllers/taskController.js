// taskController.js
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

// Get repeat dates
function getRepeatDates(startDate, repeatUntil, repeatType) {
  const dates = [];
  let curr = new Date(startDate);
  const until = new Date(repeatUntil);

  while (curr <= until) {
    dates.push(curr.toISOString().slice(0, 10)); // YYYY-MM-DD
    switch (repeatType) {
      case "daily":
        curr.setDate(curr.getDate() + 1);
        break;
      case "weekly":
        curr.setDate(curr.getDate() + 7);
        break;
      case "monthly":
        curr.setMonth(curr.getMonth() + 1);
        break;
      case "yearly":
        curr.setFullYear(curr.getFullYear() + 1);
        break;
      default:
        // Not supported
        curr.setDate(until.getDate() + 1);
    }
  }
  return dates;
}

async function createAssignedTask(req, res) {
  const {
    title,
    all_day,
    start_date,
    end_date,
    start_time,
    end_time,
    duration,
    note,
    location_id,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
    task_repeat,
    repeat_until,
  } = req.body;

  const email = req.session.userEmail;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    let series_id = null;
    let repeatDates = [start_date];

    if (task_repeat && task_repeat !== "none" && repeat_until) {
      series_id = uuidv4();
      repeatDates = getRepeatDates(start_date, repeat_until, task_repeat);
    }

    const insertedTasks = [];

    for (const date of repeatDates) {
      const [result] = await db
        .promise()
        .query(
          "INSERT INTO task (" +
            "task_title, task_duration, task_note, task_buffertime, location_id," +
            "custom_location_address, custom_location_latitude, custom_location_longitude, task_all_day," +
            "task_repeat, repeat_until, email, series_id" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            title || "Untitled Task",
            duration,
            note,
            buffer_time,
            location_id || null,
            custom_location_address || null,
            custom_location_latitude || null,
            custom_location_longitude || null,
            all_day ? 1 : 0,
            task_repeat || "none",
            repeat_until || null,
            email,
            series_id,
          ]
        );
      const task_id = result.insertId;
      insertedTasks.push(task_id);

      await db
        .promise()
        .query(
          "INSERT INTO assigned (task_id, task_start_date, task_end_date, task_start_time, task_end_time) VALUES (?, ?, ?, ?, ?)",
          [task_id, date, date, start_time, end_time]
        );

      if (Array.isArray(category_ids)) {
        for (const category_id of category_ids) {
          await db
            .promise()
            .query(
              "INSERT INTO task_category (task_id, category_id) VALUES (?, ?)",
              [task_id, category_id]
            );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Assigned task(s) created",
      series_id,
      task_ids: insertedTasks,
    });
  } catch (err) {
    console.error("Create Assigned Task Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

//Create waiting task function
async function createWaitingTask(req, res) {
  const {
    title,
    duration,
    note,
    location_id,
    due_date,
    due_time,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
  } = req.body;

  const email = req.session.userEmail;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  //Insert input into to the task table
  try {
    const [result] = await db.promise().query(
      `INSERT INTO task (
        task_title,
        task_duration,
        task_note,
        task_buffertime,
        location_id,
        custom_location_address,
        custom_location_latitude,
        custom_location_longitude,
        email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || "Untitled Task",
        duration,
        note,
        buffer_time,
        location_id || null,
        custom_location_address || null,
        custom_location_latitude || null,
        custom_location_longitude || null,
        email,
      ]
    );

    const task_id = result.insertId;

    //Insert input into to the waiting table
    await db.promise().query(
      `INSERT INTO waiting_list (
        task_id,
        task_duedate,
        task_duetime
      ) VALUES (?, ?, ?)`,
      [task_id, due_date, due_time]
    );

    //Assign categories to task
    if (Array.isArray(category_ids)) {
      for (const category_id of category_ids) {
        await db
          .promise()
          .query(
            `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
            [task_id, category_id]
          );
      }
    }

    res.status(201).json({
      success: true,
      message: "Waiting task created",
      task_id,
    });
  } catch (err) {
    console.error("Create Waiting Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

//Get assigned tasks (calendar view)
async function getAssignedTasks(req, res) {
  const { userEmail } = req.body;
  if (!userEmail) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Retrieve tasks for this user
  try {
    const taskQuery = `
      SELECT 
        t.task_id, t.task_title, t.task_note, t.task_buffertime,
        t.task_duration, t.task_all_day, t.task_repeat,  t.series_id, t.repeat_until, t.location_id, t.custom_location_address, t.custom_location_latitude, t.custom_location_longitude,
        DATE_FORMAT(a.task_start_date, '%Y-%m-%d') AS task_start_date,
        DATE_FORMAT(a.task_end_date, '%Y-%m-%d') AS task_end_date,
        TIME_FORMAT(a.task_start_time, '%H:%i') AS task_start_time,
        TIME_FORMAT(a.task_end_time, '%H:%i') AS task_end_time,
        c.category_id, c.category_name, c.category_color
      FROM task t
      JOIN assigned a ON t.task_id = a.task_id
      LEFT JOIN task_category tc ON tc.task_id = t.task_id
      LEFT JOIN category c ON tc.category_id = c.category_id
      WHERE t.email = ?
    `;

    db.query(taskQuery, [userEmail], (error, results) => {
      if (error) {
        console.error("MySQL error:", error.message);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: error.message,
        });
      }

      const taskMap = {};
      results.forEach((row) => {
        const taskKey = `${row.task_id}-${row.task_start_date}-${row.task_start_time}`;
        if (!taskMap[taskKey]) {
          taskMap[taskKey] = {
            task_id: row.task_id,
            task_title: row.task_title,
            task_note: row.task_note,
            task_buffertime: row.task_buffertime,
            task_all_day: row.task_all_day,
            location_id: row.location_id,
            custom_location_address: row.custom_location_address,
            custom_location_latitude: row.custom_location_latitude,
            custom_location_longitude: row.custom_location_longitude,
            task_duration: row.task_duration,
            task_start_date: row.task_start_date,
            task_end_date: row.task_end_date,
            task_start_time: row.task_start_time,
            task_end_time: row.task_end_time,
            series_id: row.series_id,
            task_repeat: row.task_repeat,
            repeat_until: row.repeat_until,
            categories: [],
          };
        }

        if (row.category_id) {
          taskMap[taskKey].categories.push({
            category_id: row.category_id,
            category_name: row.category_name,
            color: row.category_color,
          });
        }
      });

      const tasks = Object.values(taskMap);
      return res.status(200).json({ success: true, data: tasks });
    });
  } catch (err) {
    console.error("getAssignedTasks Error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

//Update assigned task
// Update assigned task(s) with scope support
async function updateAssignedTask(req, res) {
  const { task_id } = req.params;
  const scope = req.query.scope || "ONE";
  const {
    title,
    all_day,
    start_date,
    end_date,
    start_time,
    end_time,
    duration,
    note,
    location_id,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
  } = req.body;

  try {
    // Get current task info
    const [taskRows] = await db.promise().query(
      `SELECT t.series_id, t.task_repeat, a.task_start_date, t.email
       FROM task t
       JOIN assigned a ON t.task_id = a.task_id
       WHERE t.task_id = ?`,
      [task_id]
    );
    if (!taskRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const { series_id, task_repeat, task_start_date, email } = taskRows[0];

    // Prepare update sets
    const updateTaskSql = `UPDATE task SET
      task_title = ?,
      task_all_day = ?,
      task_duration = ?,
      task_note = ?,
      task_buffertime = ?,
      location_id = ?,
      custom_location_address = ?,
      custom_location_latitude = ?,
      custom_location_longitude = ?
    `;
    const updateAssignedSql = `UPDATE assigned SET
      task_start_date = ?,
      task_end_date = ?,
      task_start_time = ?,
      task_end_time = ?
    `;

    // Helper for updating categories
    async function updateCategories(taskIds) {
      for (const tid of taskIds) {
        await db
          .promise()
          .query(`DELETE FROM task_category WHERE task_id = ?`, [tid]);
        if (Array.isArray(category_ids)) {
          for (const category_id of category_ids) {
            await db
              .promise()
              .query(
                `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
                [tid, category_id]
              );
          }
        }
      }
    }

    // 1. ONLY THIS
    if (!series_id || task_repeat === "none" || scope === "ONE") {
      await db
        .promise()
        .query(updateTaskSql + ` WHERE task_id = ?`, [
          title || "Untitled Task",
          all_day ? 1 : 0,
          duration,
          note,
          buffer_time,
          location_id || null,
          custom_location_address || null,
          custom_location_latitude || null,
          custom_location_longitude || null,
          task_id,
        ]);
      await db
        .promise()
        .query(updateAssignedSql + ` WHERE task_id = ?`, [
          start_date,
          end_date,
          start_time,
          end_time,
          task_id,
        ]);
      await updateCategories([task_id]);
      return res.json({ success: true, message: "Assigned task updated" });
    }

    // 2. FUTURE (including this)
    if (scope === "FUTURE") {
      // Find all future task IDs in series
      const [futureRows] = await db.promise().query(
        `SELECT t.task_id FROM task t
         JOIN assigned a ON t.task_id = a.task_id
         WHERE t.series_id = ? AND a.task_start_date >= ? AND t.email = ?`,
        [series_id, task_start_date, email]
      );
      const futureTaskIds = futureRows.map((r) => r.task_id);

      for (const tid of futureTaskIds) {
        await db
          .promise()
          .query(updateTaskSql + ` WHERE task_id = ?`, [
            title || "Untitled Task",
            all_day ? 1 : 0,
            duration,
            note,
            buffer_time,
            location_id || null,
            custom_location_address || null,
            custom_location_latitude || null,
            custom_location_longitude || null,
            tid,
          ]);
        await db
          .promise()
          .query(updateAssignedSql + ` WHERE task_id = ?`, [
            start_date,
            end_date,
            start_time,
            end_time,
            tid,
          ]);
      }
      await updateCategories(futureTaskIds);
      return res.json({
        success: true,
        message: "Future assigned tasks updated",
      });
    }

    // 3. ALL
    if (scope === "ALL") {
      // Find all task IDs in series
      const [allRows] = await db
        .promise()
        .query(`SELECT task_id FROM task WHERE series_id = ? AND email = ?`, [
          series_id,
          email,
        ]);
      const allTaskIds = allRows.map((r) => r.task_id);

      for (const tid of allTaskIds) {
        await db
          .promise()
          .query(updateTaskSql + ` WHERE task_id = ?`, [
            title || "Untitled Task",
            all_day ? 1 : 0,
            duration,
            note,
            buffer_time,
            location_id || null,
            custom_location_address || null,
            custom_location_latitude || null,
            custom_location_longitude || null,
            tid,
          ]);
        await db
          .promise()
          .query(updateAssignedSql + ` WHERE task_id = ?`, [
            start_date,
            end_date,
            start_time,
            end_time,
            tid,
          ]);
      }
      await updateCategories(allTaskIds);
      return res.json({
        success: true,
        message: "All assigned tasks in series updated",
      });
    }

    res.status(400).json({ success: false, message: "Invalid update scope" });
  } catch (err) {
    console.error("Update Assigned Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

//Edit waiting task
async function updateWaitingTask(req, res) {
  const { task_id } = req.params;
  const {
    title,
    duration,
    note,
    location_id,
    due_date,
    due_time,
    buffer_time,
    category_ids,
    custom_location_address,
    custom_location_latitude,
    custom_location_longitude,
  } = req.body;

  //Update task
  try {
    await db.promise().query(
      `UPDATE task
       SET task_title = ?,
           task_duration = ?,
           task_note = ?,
           task_buffertime = ?,
           location_id = ?,
           custom_location_address = ?,
           custom_location_latitude = ?,
           custom_location_longitude = ?
       WHERE task_id = ?`,
      [
        title || "Untitled Task",
        duration,
        note,
        buffer_time,
        location_id || null,
        custom_location_address || null,
        custom_location_latitude || null,
        custom_location_longitude || null,
        task_id,
      ]
    );

    // Update only scheduling info in assigned
    await db.promise().query(
      `UPDATE waiting_list
         SET task_duedate = ?,
             task_duetime = ?
       WHERE task_id = ?`,
      [due_date, due_time, task_id]
    );

    //Reset and reassign categories
    await db
      .promise()
      .query(`DELETE FROM task_category WHERE task_id = ?`, [task_id]);

    if (Array.isArray(category_ids)) {
      for (const category_id of category_ids) {
        await db
          .promise()
          .query(
            `INSERT INTO task_category (task_id, category_id) VALUES (?, ?)`,
            [task_id, category_id]
          );
      }
    }

    res.json({ success: true, message: "Waiting task updated" });
  } catch (err) {
    console.error("Update Waiting Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete Task (and all related entries via CASCADE)
// Handles scope: "ONE" (default), "FUTURE", "ALL"
async function deleteTask(req, res) {
  const { task_id } = req.params;
  const scope = req.query.scope || "ONE";
  const email = req.session.userEmail;

  if (!email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Get the task info to check for series_id, task_repeat, and task's start date
    const [taskRows] = await db.promise().query(
      `SELECT t.series_id, t.task_repeat, a.task_start_date
       FROM task t
       JOIN assigned a ON t.task_id = a.task_id
       WHERE t.task_id = ? AND t.email = ?`,
      [task_id, email]
    );
    if (!taskRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found or access denied" });
    }

    const { series_id, task_repeat, task_start_date } = taskRows[0];

    // 1. DELETE ONLY THIS
    if (!series_id || task_repeat === "none" || scope === "ONE") {
      const [result] = await db
        .promise()
        .query(`DELETE FROM task WHERE task_id = ? AND email = ?`, [
          task_id,
          email,
        ]);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found or access denied" });
      }
      return res.json({ success: true, message: "Task deleted successfully" });
    }

    // 2. DELETE FUTURE TASKS (including this one)
    if (scope === "FUTURE") {
      // Delete all tasks in this series with start_date >= this task's date
      const [delResult] = await db.promise().query(
        `DELETE t FROM task t
         JOIN assigned a ON t.task_id = a.task_id
         WHERE t.series_id = ? AND a.task_start_date >= ? AND t.email = ?`,
        [series_id, task_start_date, email]
      );
      return res.json({
        success: true,
        message: "Future tasks deleted",
        affectedRows: delResult.affectedRows,
      });
    }

    // 3. DELETE ALL IN SERIES
    if (scope === "ALL") {
      const [delResult] = await db
        .promise()
        .query(`DELETE FROM task WHERE series_id = ? AND email = ?`, [
          series_id,
          email,
        ]);
      return res.json({
        success: true,
        message: "All tasks in series deleted",
        affectedRows: delResult.affectedRows,
      });
    }

    // Fallback error
    res.status(400).json({ success: false, message: "Invalid delete scope" });
  } catch (err) {
    console.error("Delete Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createAssignedTask,
  createWaitingTask,
  getAssignedTasks,
  updateAssignedTask,
  updateWaitingTask,
  deleteTask,
};
