//taslkController.js
const db = require("../db");

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

  const user_email = req.session.userEmail;

  if (!user_email) {
    return res
      .status(401)
      .json({ success: false, message: "Missing user session" });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO task (
        task_title,
        task_duration,
        task_note,
        task_buffertime,
        email
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, all_day, duration, note, buffer_time, user_email]
    );

    const task_id = result.insertId;

    // שמירת מידע ל־assigned
    if (start_time && end_time && start_date) {
      await db.promise().query(
        `INSERT INTO assigned (
          task_id,
          task_start_time,
          task_end_time,
          task_start_date,
          task_end_date
        ) VALUES (?, ?, ?, ?, ?)`,
        [task_id, start_time, end_time, start_date, end_date || start_date]
      );
    }

    // שמירת קטגוריות
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const values = category_ids.map((catId) => [task_id, catId]);
      await db
        .promise()
        .query(`INSERT INTO task_categories (task_id, category_id) VALUES ?`, [
          values,
        ]);
    }

    return res.status(201).json({ success: true, task_id });
  } catch (error) {
    console.error("Error creating task:", error.sqlMessage || error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// taskController.js
async function getTasks(req, res) {
  const user_email = req.session.userEmail;
  if (!user_email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        t.task_id,
        t.task_title,
        t.task_note,
        t.task_all_day,
        a.task_start_time,
        a.task_end_time,
        a.task_start_date,
        a.task_end_date,
        c.category_id,
        c.category_name,
        c.category_color
      FROM task t
      JOIN assigned a ON t.task_id = a.task_id
      LEFT JOIN task_category tc ON t.task_id = tc.task_id
      LEFT JOIN category c ON tc.category_id = c.category_id
      WHERE t.email = ?
      ORDER BY t.task_id`,
      [user_email]
    );

    const taskMap = new Map();

    for (const row of rows) {
      if (!taskMap.has(row.task_id)) {
        taskMap.set(row.task_id, {
          task_id: row.task_id,
          task_title: row.task_title,
          task_note: row.task_note,
          task_all_day: row.task_all_day === 1,
          task_start_time: row.task_start_time,
          task_end_time: row.task_end_time,
          task_start_date: row.task_start_date,
          task_end_date: row.task_end_date,
          categories: [],
        });
      }
      console.log(taskMap);

      const task = taskMap.get(row.task_id);
      if (row.category_id) {
        task.categories.push({
          category_id: row.category_id,
          name: row.category_name,
          color: row.category_color,
        });
      }
    }

    const tasks = Array.from(taskMap.values());
    console.log(tasks);
    res.json(tasks);
  } catch (err) {
    console.error("🔥 Error loading tasks:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
}

module.exports = {
  createTask,
  getTasks,
};
