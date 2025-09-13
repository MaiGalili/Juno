// locationsController.js
require("dotenv").config();

const db = require("../db");

// Add a new user-owned location. Geocodes the provided address via Google API, then saves to DB.
async function addLocation(req, res) {
  const { location_name, location_address, icon } = req.body;

  // Check if user is authenticated
  if (!req.session.userEmail) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Basic required-field validation
  if (!location_name || !location_address || !icon) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    // Build geocoding request
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location_address
    )}&key=${process.env.GOOGLE_GEO_API_KEY}`;

    // Call Google Geocoding API
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

    // Insert into DB
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

    // Return the created record
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

// Return all locations for the logged-in user.
async function getLocations(req, res) {
  const user_email = req.session.userEmail;

  if (!user_email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

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

// Delete a location by location id and user email
async function deleteLocation(req, res) {
  const { id } = req.params;

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

// Update fields of an existing user-owned location
async function updateLocation(req, res) {
  const { location_id, new_icon, new_color, new_name, new_address } = req.body;

  // Required: location_id
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

    // Collect fields to update
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

      // Re-geocode the new address
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

    // WHERE clause arguments
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
