//taskController.js
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
    user_email,
  } = req.body;

  if (!user_email) {
    return res
      .status(400)
      .json({ success: false, message: "Missing user email" });
  }

  try {
    const [result] = await db.promise().query(
      `INSERT INTO task (
        task_title,
        task_all_day,
        task_start_date,
        task_end_date,
        task_start_time,
        task_end_time,
        task_duration,
        task_note,
        location_id,
        task_due_date,
        task_due_time,
        task_buffertime,
        user_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        all_day,
        start_date,
        end_date,
        start_time,
        end_time,
        duration,
        note,
        location_id || null,
        due_date || null,
        due_time || null,
        buffer_time,
        user_email,
      ]
    );

    const task_id = result.insertId;

    // קשרי קטגוריות בטבלת many-to-many
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
    console.error("Error creating task:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createTask,
};
