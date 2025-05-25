const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

router.post("/signUp", async (req, res) => {
  const { email, password, repeatPassword } = req.body;

  // 1. ולידציה למייל
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.json({ success: false, message: "המייל אינו תקין" });
  }

  // 2. בדיקה אם המייל כבר קיים
  const [rows] = await db
    .promise()
    .query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length > 0) {
    return res.json({ success: false, message: "כבר קיים משתמש עם מייל זה" });
  }

  // 3. בדיקת אורך סיסמה
  if (!password || password.length < 8 || password.length > 20) {
    return res.json({
      success: false,
      message: "הסיסמה חייבת להיות בין 8 ל-20 תווים",
    });
  }

  // 4. בדיקה שסיסמה חוזרת תואמת
  if (password !== repeatPassword) {
    return res.json({ success: false, message: "הסיסמאות אינן תואמות" });
  }

  // 5. הצפנת סיסמה
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "INSERT INTO users (email, password) VALUES (?, ?)";
    await db.promise().query(query, [email, hashedPassword]);

    // 6. הצלחה
    return res.json({ success: true, message: "ההרשמה בוצעה בהצלחה" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, message: "שגיאה בשרת" });
  }
});

module.exports = router;
