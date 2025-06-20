// locationsController.js
// Load environment variables from .env
require("dotenv").config();

const db = require("../db");

// Add location function
async function addLocation(req, res) {
  const { location_name, location_address, icon } = req.body;

  // Check if user is authenticated
  if (!req.session.userEmail) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Validate required fields
  if (!location_name || !location_address || !icon) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    // Call Google Geocoding API to get coordinates from address
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location_address
    )}&key=${process.env.GOOGLE_GEO_API_KEY}`;

    const geoRes = await fetch(url);
    if (!geoRes.ok) {
      throw new Error(`Geocoding API returned status ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    const result = geoData.results[0];
    const coords = result?.geometry?.location;

    if (!coords) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to geocode address" });
    }

    const { lat: latitude, lng: longitude } = coords;

    // Save the location to the database
    const [dbRes] = await db.promise().query(
      `INSERT INTO location (location_name, location_address, latitude, longitude, user_email, icon)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        location_name,
        location_address,
        latitude,
        longitude,
        req.session.userEmail,
        icon,
      ]
    );

    // Return the new location
    res.status(201).json({
      success: true,
      message: "Location added successfully",
      location: {
        location_id: dbRes.insertId,
        location_name,
        location_address,
        latitude,
        longitude,
        icon,
      },
    });
  } catch (error) {
    console.error("Error adding location:", {
      message: error.message,
    });
    res.status(500).json({ success: false, message: "Failed to add location" });
  }
}

// Get all locations for the logged-in user
async function getLocations(req, res) {
  const user_email = req.session.userEmail;

  // Check if user is logged in
  if (!user_email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Retrieve locations for this user
  try {
    const [results] = await db.promise().query(
      `SELECT location_id, location_name, location_address, latitude, longitude, icon, color
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

// Delete location function
async function deleteLocation(req, res) {
  const { id } = req.params;

  // Only delete if it belongs to the logged-in user
  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM location WHERE location_id = ? AND user_email = ?", [
        id,
        req.session.userEmail,
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Location not found or unauthorized",
      });
    }

    res.json({ success: true, message: "Location deleted" });
  } catch (error) {
    console.error("Error deleting location:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete location" });
  }
}

// Update location function
async function updateLocation(req, res) {
  const { location_id, new_icon, new_color, new_name, new_address } = req.body;

  // Validate required values
  if (!location_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing location_id" });
  }

  if (!req.session.userEmail) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const fields = [];
    const values = [];

    // Prepare update fields
    if (new_icon) {
      fields.push("icon = ?");
      values.push(new_icon);
    }

    if (new_color) {
      fields.push("color = ?");
      values.push(new_color);
    }

    if (new_name) {
      fields.push("location_name = ?");
      values.push(new_name);
    }

    if (new_address) {
      fields.push("location_address = ?");
      values.push(new_address);

      // Get updated coordinates from new address
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        new_address
      )}&key=${process.env.GOOGLE_GEO_API_KEY}`;
      const geoRes = await fetch(url);

      if (!geoRes.ok) {
        throw new Error(`Geocoding API returned status ${geoRes.status}`);
      }

      const geoData = await geoRes.json();
      const result = geoData.results[0];
      const coords = result?.geometry?.location;

      if (coords) {
        fields.push("latitude = ?");
        values.push(coords.lat);
        fields.push("longitude = ?");
        values.push(coords.lng);
      }
    }

    // If there's nothing to update
    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });
    }

    // Add WHERE clause values
    values.push(location_id, req.session.userEmail);

    const query = `UPDATE location SET ${fields.join(
      ", "
    )} WHERE location_id = ? AND user_email = ?`;

    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Location not found or unauthorized",
      });
    }

    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error("Error updating location:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update location" });
  }
}
module.exports = {
  addLocation,
  getLocations,
  deleteLocation,
  updateLocation,
};
