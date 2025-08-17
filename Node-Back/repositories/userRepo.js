// repositories/userRepo.js
const db = require("../db");


exports.getSettings = async (email) => {
  const [rows] = await db.promise().query(
    `
    SELECT defult_buffer, start_day_time, end_day_time, default_location_id
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );
  return rows[0] || {};
};
