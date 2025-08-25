// repositories/locationRepo.js
const db = require("../db");

exports.getUserLocationById = async (email, locationId) => {
  const [rows] = await db.promise().query(
    `SELECT location_name,
            location_latitude  AS lat,
            location_longitude AS lng
     FROM location
     WHERE user_email = ? AND location_id = ?
     LIMIT 1`,
    [email, locationId]
  );
  return rows[0] || null;
};
