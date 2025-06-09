require("dotenv").config();
const axios = require("axios");
const db = require("../db");

async function addLocation(req, res) {
  const { location_name, location_address, user_email, icon } = req.body;

  if (!location_name || !location_address || !user_email || !icon) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    const geoRes = await axios.get(
      "https://api.openrouteservice.org/geocode/search",
      {
        params: {
          api_key: process.env.OPENROUTESERVICE_API_KEY,
          text: location_address,
          size: 1,
        },
      }
    );

    const coords = geoRes.data.features[0]?.geometry?.coordinates;
    if (!coords) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to geocode address" });
    }

    const [longitude, latitude] = coords;

    const [result] = await db.promise().query(
      `INSERT INTO location (location_name, location_address, latitude, longitude, user_email, icon)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [location_name, location_address, latitude, longitude, user_email, icon]
    );

    res.status(201).json({
      success: true,
      message: "Location added successfully",
      location: {
        location_id: result.insertId,
        location_name,
        location_address,
        latitude,
        longitude,
        icon,
      },
    });
  } catch (error) {
    console.error("Error adding location:", error.message);
    res.status(500).json({ success: false, message: "Failed to add location" });
  }
}

async function getLocations(req, res) {
  const user_email = req.session.userEmail;
  if (!user_email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const [results] = await db.promise().query(
      `SELECT location_id, location_name, location_address, latitude, longitude, icon
         FROM location
         WHERE user_email = ?`,
      [user_email]
    );

    res.json(results);
  } catch (error) {
    console.error("Error fetching locations:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch locations" });
  }
}

async function deleteLocation(req, res) {
  const { id } = req.params;
  try {
    await db
      .promise()
      .query("DELETE FROM locations WHERE location_id = ?", [id]);
    res.json({ success: true, message: "Location deleted" });
  } catch (error) {
    console.error("Error deleting location:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete location" });
  }
}

async function updateLocation(req, res) {
  const { location_id, new_icon } = req.body;

  if (!location_id || !new_icon) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    await db
      .promise()
      .query("UPDATE locations SET icon = ? WHERE location_id = ?", [
        new_icon,
        location_id,
      ]);

    res.json({ success: true, message: "Icon updated" });
  } catch (error) {
    console.error("Error updating icon:", error.message);
    res.status(500).json({ success: false, message: "Failed to update icon" });
  }
}

module.exports = {
  addLocation,
  getLocations,
  deleteLocation,
  updateLocation,
};
