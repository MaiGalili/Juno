// repositories/locationRepo.js
const db = require("../db");

// Get user location by id
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
  //Take the first (and only) row if present
  const r = rows[0];
  if (!r) return null;
  // Enforce numeric types for lat/lng; keep field names stable for consumers
  return {
    location_name: r.location_name,
    lat: Number(r.lat),
    lng: Number(r.lng),
  };
};
