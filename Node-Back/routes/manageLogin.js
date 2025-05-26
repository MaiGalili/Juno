const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// === Sign Up ===
router.post("/signUp", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";
    await db.promise().query(insertQuery, [email, hashedPassword]);

    return res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// === Login ===
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

// === Password Reset ===
router.post("/resetPassword", async (req, res) => {
  const { email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "UPDATE users SET password = ? WHERE email = ?";
    db.query(query, [hashedPassword, email], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: "Server error" });
      }
      return res.json({ success: true, message: "Password reset successful" });
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// === Email Lookup (Forgot Password) ===
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

module.exports = router;
