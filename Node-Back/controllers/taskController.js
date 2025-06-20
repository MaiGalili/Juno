// taskController.js
const db = require("../db");

// Create assigned task
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
  } = req.body;

  const email = req.session.userEmail;
  if (!email)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    //Insert input into to the task table
    const [result] = await db.promise().query(
      `INSERT INTO task (
        task_title,
        task_duration,
        task_note,
        task_buffertime,
        location_id,
        email
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title || "Untitled Task",
        duration,
        note,
        buffer_time,
        location_id || null,
        email,
      ]
    );

    const task_id = result.insertId;

    //Insert input into to the assigned table
    await db.promise().query(
      `INSERT INTO assigned (
        task_id,
        task_all_day,
        task_start_date,
        task_end_date,
        task_start_time,
        task_end_time
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [task_id, all_day ? 1 : 0, start_date, end_date, start_time, end_time]
    );

    //Assign categories
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

    //Return response
    res.status(201).json({
      success: true,
      message: "Assigned task created",
      task_id,
    });
  } catch (err) {
    console.error("Create Assigned Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

//Create waiting task
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
        email
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title || "Untitled Task",
        duration,
        note,
        buffer_time,
        location_id || null,
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

    //Assign categories
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

    //Return response
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

  try {
    const taskQuery = `
      SELECT 
        t.task_id, t.task_title, t.task_note, t.task_buffertime,
        t.task_duration, a.task_all_day,
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
            talk_all_day: row.task_all_day,
            task_duration: row.task_duration,
            task_start_date: row.task_start_date,
            task_end_date: row.task_end_date,
            task_start_time: row.task_start_time,
            task_end_time: row.task_end_time,
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

//Edit assigned task
async function updateAssignedTask(req, res) {
  const { task_id } = req.params;
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
  } = req.body;

  //Update task
  try {
    await db.promise().query(
      `UPDATE task
       SET task_title = ?,
           task_duration = ?,
           task_note = ?,
           task_buffertime = ?,
           location_id = ?
       WHERE task_id = ?`,
      [
        title || "Untitled Task",
        duration,
        note,
        buffer_time,
        location_id || null,
        task_id,
      ]
    );

    //Update assigned
    await db.promise().query(
      `UPDATE assigned
       SET task_all_day = ?,
           task_start_date = ?,
           task_end_date = ?,
           task_start_time = ?,
           task_end_time = ?
       WHERE task_id = ?`,
      [all_day ? 1 : 0, start_date, end_date, start_time, end_time, task_id]
    );

    //Update categories
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

    //Response
    res.json({ success: true, message: "Assigned task updated" });
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
  } = req.body;

  //Update task
  try {
    await db.promise().query(
      `UPDATE task
       SET task_title = ?,
           task_duration = ?,
           task_note = ?,
           task_buffertime = ?,
           location_id = ?
       WHERE task_id = ?`,
      [
        title || "Untitled Task",
        duration,
        note,
        buffer_time,
        location_id || null,
        task_id,
      ]
    );

    //Update waiting list
    await db.promise().query(
      `UPDATE waiting_list
       SET task_duedate = ?,
           task_duetime = ?
       WHERE task_id = ?`,
      [due_date, due_time, task_id]
    );

    //Update categories
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

    // Response
    res.json({ success: true, message: "Waiting task updated" });
  } catch (err) {
    console.error("Update Waiting Task Error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Delete Task (and all related entries via CASCADE)
async function deleteTask(req, res) {
  const { task_id } = req.params;
  const email = req.session.userEmail;

  if (!email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
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

    res.json({ success: true, message: "Task deleted successfully" });
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
