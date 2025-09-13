// repositories/userRepo.js
const db = require("../db");
//Fetches user settings by email.
exports.getSettings = async (email) => {
  const [rows] = await db.promise().query(
    `SELECT defult_buffer, start_day_time, end_day_time,
           default_location_id, waiting_list_max, travel_mode
    FROM users
    WHERE email = ?
    LIMIT 1`,
    [email]
  );
  // Return the first row if exists; otherwise return an empty object
  return rows[0] || {};
};
