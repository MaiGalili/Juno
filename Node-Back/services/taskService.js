//taskService.js
const db = require("../db");

//Return assigned tasks whose START date is within [startDate, endDate] (inclusive)
exports.getAssignedBetween = async (email, startDate, endDate) => {
  // include tasks that start and end between startDate and endDate
  const [rows] = await db.execute(
    `SELECT t.task_id, a.task_start_date, a.task_end_date,
           a.task_start_time, a.task_end_time
    FROM assigned a
    JOIN task t ON t.task_id = a.task_id
    WHERE t.email = ?
      AND a.task_start_date >= ?
      AND a.task_start_date <= ?
    ORDER BY a.task_start_date, a.task_start_time`,
    [email, startDate, endDate]
  );
  return rows;
};
