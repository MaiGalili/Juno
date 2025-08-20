// searchController.js
const db = require("../db");

exports.searchTasks = async (req, res) => {
  try {
    const userEmail = req.session?.userEmail;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const q = (req.query.q || "").trim();
    if (q.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Basic LIKE search. You can swap to FULLTEXT if you want later.
    const like = `%${q}%`;

    // Return a compact item: id, type ("assigned" | "waiting"), title, date/time preview
    const [rows] = await db.promise().query(
      `
      (
        SELECT t.task_id AS id, 'assigned' AS type, t.task_title AS title,
               a.task_start_date AS date, a.task_start_time AS time
        FROM task t
        JOIN assigned a ON a.task_id = t.task_id
        WHERE t.email = ? AND t.task_title LIKE ?
      )
      UNION ALL
      (
        SELECT t.task_id AS id, 'waiting' AS type, t.task_title AS title,
               w.task_duedate AS date, w.task_duetime AS time
        FROM task t
        JOIN waiting_list w ON w.task_id = t.task_id
        WHERE t.email = ? AND t.task_title LIKE ?
      )
      ORDER BY date IS NULL, date ASC, time ASC
      LIMIT 15
      `,
      [userEmail, like, userEmail, like]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("searchTasks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
