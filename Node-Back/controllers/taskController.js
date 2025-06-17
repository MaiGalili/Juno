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
      ) VALUES (?, ?, ?, ?, ?)`,
      [title, duration, note, buffer_time, user_email]
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
        JSON_ARRAYAGG(
          JSON_OBJECT('category_id', c.category_id, 'name', c.category_name, 'color', c.category_color)
        ) AS categories
      FROM task t
      JOIN assigned a ON t.task_id = a.task_id
      LEFT JOIN task_category tc ON t.task_id = tc.task_id
      LEFT JOIN category c ON tc.category_id = c.category_id
      WHERE t.email = ?
      GROUP BY t.task_id`,
      [user_email]
    );

    // ודאי שפרס JSON תקין
    const parsedRows = rows.map((row) => ({
      ...row,
      categories: JSON.parse(row.categories),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("Error loading tasks:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createTask,
  getTasks,
};
