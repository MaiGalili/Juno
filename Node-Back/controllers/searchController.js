// controllers/searchController.js
const db = require("../db");

// Returns an array of lightweight task hits: [{ id, type: 'assigned'|'waiting', title, date, time }]
exports.searchTasks = async (req, res) => {
  try {
    const userEmail = req.session?.userEmail;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Normalize the query string; empty → return no results
    const q = String(req.query.q || "").trim();
    if (q.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Use parameterized LIKE to avoid injection and to allow substring matches
    const like = `%${q}%`;

    // Assigned tasks (with start date/time)
    const [assigned] = await db.promise().query(
      `SELECT t.task_id AS id, t.task_title AS title,
             a.task_start_date AS date, a.task_start_time AS time
      FROM task t
      JOIN assigned a ON a.task_id = t.task_id
      WHERE t.email = ? AND t.task_title LIKE ?
      ORDER BY a.task_start_date DESC, a.task_start_time DESC
      LIMIT 10`,
      [userEmail, like]
    );

    // Waiting tasks (with due date/time)
    const [waiting] = await db.promise().query(
      `SELECT t.task_id AS id, t.task_title AS title,
             w.task_duedate AS date, w.task_duetime AS time
      FROM task t
      JOIN waiting_list w ON w.task_id = t.task_id
      WHERE t.email = ? AND t.task_title LIKE ?
      ORDER BY w.task_duedate DESC, w.task_duetime DESC
      LIMIT 10`,
      [userEmail, like]
    );

    // Merge the two groups. Limit to 15. assigned first
    const data = [
      ...assigned.map((r) => ({ ...r, type: "assigned" })),
      ...waiting.map((r) => ({ ...r, type: "waiting" })),
    ].slice(0, 15); // cap total

    res.json({ success: true, data });
  } catch (err) {
    console.error("searchTasks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
