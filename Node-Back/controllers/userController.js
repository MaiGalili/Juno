//userController.js
const db = require("../db");

// Get user settings
exports.getUserSettings = async (req, res) => {
  try {
    const email = req.session?.userEmail || req.query.email;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "User email is required" });
    }

    const [rows] = await db.promise().query(
      `SELECT defult_buffer, start_day_time, end_day_time,
                waiting_list_max, default_location_id, travel_mode
         FROM users WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Mirror DB field names as-is to keep a stable API contract
    res.json({
      success: true,
      defult_buffer: rows[0].defult_buffer,
      start_day_time: rows[0].start_day_time,
      end_day_time: rows[0].end_day_time,
      waiting_list_max: rows[0].waiting_list_max,
      default_location_id: rows[0].default_location_id,
      travel_mode: rows[0].travel_mode,
    });
  } catch (err) {
    console.error("Error in getUserSettings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user settings
exports.updateSettings = async (req, res) => {
  try {
    const email = req.session?.userEmail;
    if (!email)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      defult_buffer, // keep DB spelling
      start_day_time,
      end_day_time,
      waiting_list_max,
      default_location_id, // may be "", null, a number
      travel_mode, // 'driving' | 'walking' | 'bicycling' | 'transit'
    } = req.body || {};

    // validation
    const parseHHMM = (s) => /^\d{2}:\d{2}$/.test(s || ""); // HH:MM

    if (defult_buffer && !parseHHMM(defult_buffer)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid buffer time" });
    }
    if (start_day_time && !parseHHMM(start_day_time)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid start_day_time" });
    }
    if (end_day_time && !parseHHMM(end_day_time)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid end_day_time" });
    }
    if (waiting_list_max != null && Number(waiting_list_max) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "waiting_list_max must be >= 0" });
    }
    if (travel_mode != null) {
      const allowed = new Set(["driving", "walking", "bicycling", "transit"]);
      if (!allowed.has(String(travel_mode))) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid travel_mode" });
      }
    }

    // Normalize default_location_id.Treat "" as null so users can clear the default.
    const normalizedDefaultLoc =
      default_location_id === "" || default_location_id == null
        ? null
        : Number(default_location_id);

    // If not null, verify it belongs to the user
    if (normalizedDefaultLoc != null) {
      const [rows] = await db
        .promise()
        .query(
          "SELECT 1 FROM location WHERE location_id=? AND user_email=? LIMIT 1",
          [normalizedDefaultLoc, email]
        );
      if (rows.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid default_location_id" });
      }
    }

    // Dynamic update
    const fields = [];
    const vals = [];

    if (defult_buffer != null) {
      fields.push("defult_buffer=?");
      vals.push(defult_buffer);
    }
    if (start_day_time != null) {
      fields.push("start_day_time=?");
      vals.push(start_day_time);
    }
    if (end_day_time != null) {
      fields.push("end_day_time=?");
      vals.push(end_day_time);
    }
    if (waiting_list_max != null) {
      fields.push("waiting_list_max=?");
      vals.push(waiting_list_max);
    }
    if (default_location_id !== undefined) {
      fields.push("default_location_id=?");
      vals.push(normalizedDefaultLoc);
    }
    if (travel_mode != null) {
      fields.push("travel_mode=?");
      vals.push(travel_mode);
    }

    if (!fields.length)
      return res.json({ success: true, message: "Nothing to update" });

    vals.push(email);
    await db
      .promise()
      .query(`UPDATE users SET ${fields.join(", ")} WHERE email=?`, vals);
    return res.json({ success: true });
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
