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

    const [rows] = await db
      .promise()
      .query(
        "SELECT defult_buffer, start_day_time, end_day_time, default_location_id FROM users WHERE email = ?",
        [email]
      );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      defult_buffer: rows[0].defult_buffer,
      start_day_time: rows[0].start_day_time,
      end_day_time: rows[0].end_day_time,
      default_location_id: rows[0].default_location_id,
    });
  } catch (err) {
    console.error("Error in getUserSettings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};