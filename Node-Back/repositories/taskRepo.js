// taskRepo.js
const db = require("../db");

async function getAssignedBetween(email, startDate, endDate) {
  const [rows] = await db.query(
    `SELECT a.task_start_date, a.task_start_time, a.task_end_time, t.task_all_day
     FROM assigned a
     JOIN task t ON t.task_id = a.task_id
     WHERE t.email = ? AND a.task_start_date BETWEEN ? AND ?
     ORDER BY a.task_start_date, a.task_start_time`,
    [email, startDate, endDate]
  );
  return rows;
}

module.exports = { getAssignedBetween };
