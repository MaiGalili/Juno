require("dotenv").config();
const axios = require("axios");
const db = require("../db");

// פונקציה להוספת מיקום חדש
async function addLocation(req, res) {
  const { location_name, address } = req.body;
  const user_email = req.session.userEmail;

  if (!location_name || !address || !user_email) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    // קריאה ל־OpenRouteService Geocoding API
    const geoResponse = await axios.get(
      "https://api.openrouteservice.org/geocode/search",
      {
        params: {
          api_key: process.env.ORS_API_KEY,
          text: address,
          size: 1,
        },
      }
    );

    const coords = geoResponse.data.features[0]?.geometry?.coordinates;
    if (!coords) throw new Error("Coordinates not found");

    const [lon, lat] = coords;

    await db
      .promise()
      .query(
        "INSERT INTO location (location_name, address, latitude, longitude, user_email) VALUES (?, ?, ?, ?, ?)",
        [location_name, address, lat, lon, user_email]
      );

    res.json({ success: true, message: "Location added successfully" });
  } catch (err) {
    console.error("Error adding location:", err);
    res.status(500).json({ success: false, message: "Failed to add location" });
  }
}

// שליפת כל המיקומים למשתמש
async function getLocations(req, res) {
  const user_email = req.session.userEmail;
  if (!user_email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM locations WHERE user_email = ?", [user_email]);
    res.json(rows); // תמיד מחזיר מערך
  } catch (err) {
    console.error("❌ Error fetching locations:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch locations" });
  }
}


// מחיקת מיקום
async function deleteLocation(req, res) {
  const { id } = req.params;
  try {
    await db
      .promise()
      .query("DELETE FROM location WHERE location_id = ?", [id]);
    res.json({ success: true, message: "Location deleted" });
  } catch (err) {
    console.error("Error deleting location:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete location" });
  }
}

module.exports = {
  addLocation,
  getLocations,
  deleteLocation,
};
