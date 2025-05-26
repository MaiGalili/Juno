const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

router.post("/getEmail", async (req, res) => {
  const query = "SELECT email FROM users WHERE email = ?";
  db.query(query, [req.body.email], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Server error" });
    }
    if (result.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, email: result[0].email });
  });
});

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Server error" });
    }
    if (result.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, result[0].password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect username or password.",
      });
    }
    return res.json({ success: true, message: "Login successful" });
  });
});

router.post("/resetPassword", async (req, res) => {
  const { email, password } = req.body;
  const query = "UPDATE users SET password = ? WHERE email = ?";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  db.query(query, [hashedPassword, email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, message: "Server error" });
    }
    return res.json({ success: true, message: "Password reset successful" });
  });
});

module.exports = router;
