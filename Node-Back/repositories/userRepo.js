// userRepo.js
const db = require("../db");

async function getSettings(email) {
  const [rows] = await db.query(
    `SELECT defult_buffer, start_day_time, end_day_time
     FROM users WHERE email=? LIMIT 1`,
    [email]
  );
  return (
    rows[0] || {
      defult_buffer: "00:10:00",
      start_day_time: "08:00:00",
      end_day_time: "21:00:00",
    }
  );
}

module.exports = { getSettings };
