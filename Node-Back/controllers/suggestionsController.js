const db = require("../db");
const axios = require("axios");

// Generate suggestions for a task
async function getSuggestions(req, res) {
  try {
    const {
      due_date,
      due_time,
      duration,
      buffer_time = 0,
      location_id,
      email,
      page = 1,
    } = req.body;

    console.log("➡ Incoming request:", req.body);

    // === Validation ===
    if (!due_date || !duration || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (due_date, duration, email).",
      });
    }

    // Validate duration format
    if (!/^\d{2}:\d{2}$/.test(duration)) {
      return res.status(400).json({
        success: false,
        message: "Duration must be in HH:mm format.",
      });
    }

    // Convert duration HH:mm → total minutes
    const [hours, mins] = duration.split(":").map(Number);
    const durationMinutes = hours * 60 + mins;

    // === Get user working hours ===
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

    let startDay = toMinutes(userResult[0].user_start_time);
    let endDay = toMinutes(userResult[0].user_end_time);

    // If due_time is provided → override endDay to not exceed that time
    if (due_time) {
      const dueMinutes = toMinutes(due_time);
      endDay = Math.min(endDay, dueMinutes);
    }

    console.log(
      `Working window: ${fromMinutes(startDay)} - ${fromMinutes(endDay)}`
    );

    // === Get all assigned tasks for that day ===
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

    console.log(`Tasks found: ${tasks.length}`);

    // === Get new task destination location ===
    let destination = null;
    if (location_id) {
      const [locResult] = await db
        .promise()
        .query(`SELECT location_address FROM locations WHERE location_id = ?`, [
          location_id,
        ]);
      destination = locResult[0]?.location_address || null;
    }

    // === Generate available time slots ===
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

    // Gap after last task
    if (endDay - currentTime >= durationMinutes + buffer_time) {
      availableSlots.push({
        start: fromMinutes(currentTime),
        end: fromMinutes(currentTime + durationMinutes),
        origin: tasks.length ? tasks[tasks.length - 1].location_address : null,
      });
    }

    // === Paginate (3 per page) ===
    const startIndex = (page - 1) * 3;
    const slotsPage = availableSlots.slice(startIndex, startIndex + 3);

    // === Add Google travel time if possible ===
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

// === Helpers ===
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total) {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

async function getTravelTime(origin, destination) {
  try {
    const apiKey = process.env.GOOGLE_GEO_API_KEY;
    if (!apiKey) {
      console.warn("⚠ Missing Google API Key");
      return "N/A";
    }

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
