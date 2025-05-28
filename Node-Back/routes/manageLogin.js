const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

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

router.post("/sendResetCode", (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "junocalendar2025@gmail.com",
      pass: "ygnp yhoi jrwo hppz",
    },
  });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err) return res.json({ success: false, message: "Server error" });

    if (users.length === 0)
      return res.json({ success: false, message: "Email not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const emailText = `
                  Hello,

                  We received a request to reset your password for Juno Calendar.

                  Your password reset code is:

                  ${code}

                  If you did not request a password reset, please ignore this message.

                  Best regards,
                  The Juno Calendar Team
                  `;

    transporter.sendMail(
      {
        from: "junocalendar2025@gmail.com",
        to: email,
        subject: "Password Reset Code",
        text: emailText,
      },
      (err2, info) => {
        if (err2) {
          return res.json({ success: false, message: "Failed to send email" });
        }
        res.json({ success: true, message: "Code sent", code });
      }
    );
  });
});

// === Password Reset ===
router.put("/resetPassword", (req, res) => {
  const { email, password } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.json({ success: false, message: "Server error" });

    bcrypt.hash(password, salt, (err2, hashed) => {
      if (err2) return res.json({ success: false, message: "Server error" });

      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashed, email],
        (err3) => {
          if (err3)
            return res.json({ success: false, message: "Server error" });

          res.json({ success: true, message: "Password reset successfully" });
        }
      );
    });
  });
});

module.exports = router;
