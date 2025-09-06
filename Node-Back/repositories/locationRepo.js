// repositories/locationRepo.js
const db = require("../db");

exports.getUserLocationById = async (email, locationId) => {
  const [rows] = await db.promise().query(
    `SELECT location_name,
            latitude  AS lat,
            longitude AS lng
     FROM location
     WHERE user_email = ? AND location_id = ?
     LIMIT 1`,
    [email, locationId]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    location_name: r.location_name,
    lat: Number(r.lat),
    lng: Number(r.lng),
  };
};