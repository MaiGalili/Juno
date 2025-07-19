const db = require("../db");
const axios = require("axios");

// Generate suggestions for a task
async function getSuggestions(req, res) {
  try {
    const {
      due_date,
      duration,
      buffer_time,
      location_id,
      email,
      page = 1,
    } = req.body;

    if (!due_date || !duration || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    // Convert duration HH:mm → total minutes
    const [hours, mins] = duration.split(":").map(Number);
    const durationMinutes = hours * 60 + mins;

    // Get user working hours
    const [userResult] = await db
      .promise()
      .query(
        `SELECT user_start_time, user_end_time FROM user WHERE email = ?`,
        [email]
      );
    if (!userResult.length) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const startDay = toMinutes(userResult[0].user_start_time);
    const endDay = toMinutes(userResult[0].user_end_time);

    // Get all assigned tasks for that day
    const [tasks] = await db.promise().query(
      `SELECT t.task_id, a.task_start_time, a.task_end_time, a.task_start_date,
              loc.location_address
       FROM task t
       JOIN assigned a ON t.task_id = a.task_id
       LEFT JOIN locations loc ON t.location_id = loc.location_id
       WHERE t.email = ? AND a.task_start_date = ?
       ORDER BY a.task_start_time ASC`,
      [email, due_date]
    );

    // Get new task location
    let destination = null;
    if (location_id) {
      const [locResult] = await db
        .promise()
        .query(`SELECT location_address FROM locations WHERE location_id = ?`, [
          location_id,
        ]);
      destination = locResult[0]?.location_address || null;
    }

    // Generate available time slots
    let currentTime = startDay;
    const availableSlots = [];

    for (let i = 0; i < tasks.length; i++) {
      const taskStart = toMinutes(tasks[i].task_start_time);
      const gap = taskStart - currentTime;

      if (gap >= durationMinutes + buffer_time) {
        availableSlots.push({
          start: fromMinutes(currentTime),
          end: fromMinutes(currentTime + durationMinutes),
          origin: tasks[i - 1]?.location_address || null,
        });
      }

      currentTime = toMinutes(tasks[i].task_end_time);
    }

    // Last gap after last task
    if (endDay - currentTime >= durationMinutes + buffer_time) {
      availableSlots.push({
        start: fromMinutes(currentTime),
        end: fromMinutes(currentTime + durationMinutes),
        origin: tasks.length ? tasks[tasks.length - 1].location_address : null,
      });
    }

    // Paginate 3 per page
    const startIndex = (page - 1) * 3;
    const slotsPage = availableSlots.slice(startIndex, startIndex + 3);

    // Add Google travel time if origin & destination exist
    for (let slot of slotsPage) {
      if (slot.origin && destination) {
        slot.travel_time = await getTravelTime(slot.origin, destination);
      } else {
        slot.travel_time = "N/A";
      }
    }

    res.json({
      success: true,
      slots: slotsPage,
      hasMore: startIndex + 3 < availableSlots.length,
    });
  } catch (err) {
    console.error("Error in getSuggestions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Convert time string to minutes
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Convert minutes back to HH:mm
function fromMinutes(total) {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// Call Google Maps API
async function getTravelTime(origin, destination) {
  try {
    const apiKey = process.env.GOOGLE_GEO_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
    const response = await axios.get(url);

    const element = response.data.rows[0].elements[0];
    return element.status === "OK" ? element.duration.text : "N/A";
  } catch (error) {
    console.error("Google API Error:", error.message);
    return "N/A";
  }
}

module.exports = { getSuggestions };
