const db = require("../db");

// Create Task and Save Assignment
async function createTask(req, res) {
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
    due_date,
    due_time,
    buffer_time,
    category_ids,
  } = req.body;

  const email = req.session.userEmail;

  if (!email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // 1. יצירת משימה בטבלה הראשית
    const [result] = await db.promise().query(
      `INSERT INTO task (
        task_title,
        task_all_day,
        task_duration,
        task_note,
        task_buffertime,
        task_due_date,
        task_due_time,
        location_id,
        email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || "Untitled Task",
        all_day ? 1 : 0,
        duration,
        note,
        buffer_time,
        due_date,
        due_time,
        location_id || null,
        email,
      ]
    );

    const task_id = result.insertId;

    // 2. שמירת מידע מתוזמן אם קיים
    if (start_date && end_date && start_time && end_time) {
      await db.promise().query(
        `INSERT INTO assigned (
          task_id,
          task_start_date,
          task_end_date,
          task_start_time,
          task_end_time
        ) VALUES (?, ?, ?, ?, ?)`,
        [task_id, start_date, end_date, start_time, end_time]
      );
    }

    // 3. שיוך לקטגוריות
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

    res.status(201).json({ success: true, message: "Task created", task_id });
  } catch (err) {
    console.error("Failed to create task:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Fetch Assigned Tasks for Calendar
// Fetch Assigned Tasks for Calendar
async function getAssignedTasks(req, res) {
  const {userEmail} = req.body
  console.log("Fetching tasks for user:", userEmail);

  if (!userEmail) {
    console.warn("No user email in session!");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const taskQuery = `
      SELECT 
        t.task_id,
        t.task_title,
        t.task_note,
        t.task_buffertime,
        t.task_duration,
        a.task_start_date,
        a.task_end_date,
        a.task_start_time,
        a.task_end_time,
        c.category_id,
        c.category_name,
        c.category_color
      FROM task t
      JOIN assigned a ON t.task_id = a.task_id
      LEFT JOIN task_category tc ON tc.task_id = t.task_id
      LEFT JOIN category c ON tc.category_id = c.category_id
      WHERE t.email = ?
    `;

    console.log("Running query to fetch tasks...");

    db.query(taskQuery, [userEmail], (error, results) => {
      if (error) {
        console.error("MySQL error:", error.sqlMessage || error.message, error);
        return res
          .status(500)
          .json({
            success: false,
            message: "Database error",
            error: error.message,
          });
      }

      console.log("Query successful. Rows fetched:", results.length);
      if (!results || results.length === 0) {
        console.warn("⚠️ No assigned tasks found for user:", userEmail);
      }

      const taskMap = {};

      try {
        results.forEach((row) => {
          const taskKey = `${row.task_id}-${row.task_start_date}-${row.task_start_time}`;

          if (!taskMap[taskKey]) {
            taskMap[taskKey] = {
              task_id: row.task_id,
              task_title: row.task_title,
              task_note: row.task_note,
              task_buffertime: row.task_buffertime,
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

        console.log("Returning tasks to client. Total tasks:", tasks.length);
        return res.status(200).json({ success: true, data: tasks });
      } catch (mapErr) {
        console.error("Error mapping tasks:", mapErr.message);
        return res
          .status(500)
          .json({ success: false, message: "Failed to process task data" });
      }
    });
  } catch (err) {
    console.error("Server error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  createTask,
  getAssignedTasks,
};
