//authController.js
// Import required modules
const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Load environment variables from .env
require("dotenv").config();  

//Sign up function
async function signUp(req, res) {
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

    // Insert new user into database
    await db
      .promise()
      .query("INSERT INTO users (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);

    // Add default categories for new user
    const defaultCategories = [
      { name: "Work", color: "#d5d5ff" },
      { name: "Home", color: "#e0ffe0" },
      { name: "Friends", color: "#fff0cc" },
    ];

    const insertCategoryQuery = `
      INSERT INTO category (category_name, category_color, user_email)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE category_color = VALUES(category_color)
    `;

    for (const cat of defaultCategories) {
      await db
        .promise()
        .query(insertCategoryQuery, [cat.name, cat.color, email]);
    }

    return res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

//Login function
async function login(req, res) {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) return res.json({ success: false, message: "Server error" });

      if (result.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }

      // Check if password  matches
      const isMatch = await bcrypt.compare(password, result[0].password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Incorrect username or password.",
        });
      }

      // Store user's email in session
      req.session.userEmail = email;
      console.log("Session created after login:", req.session);

      return res.json({ success: true, message: "Login successful" });
    }
  );
}

//Get session function
function getSession(req, res) {
  const userEmail = req.session.userEmail;
  if (userEmail) {
    return res.json({ success: true, userEmail });
  } else {
    return res.json({ success: false, message: "No session found" });
  }
}

//Logout function
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    return res.json({ success: true, message: "Logged out successfully" });
  });
}

//Get email function
function getEmail(req, res) {
  db.query(
    "SELECT email FROM users WHERE email = ?",
    [req.body.email],
    (err, result) => {
      if (err) return res.json({ success: false, message: "Server error" });
      if (result.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }
      return res.json({ success: true, email: result[0].email });
    }
  );
}

//Send reset code function
function sendResetCode(req, res) {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err) {
      return res.json({ success: false, message: "Server error" });
    }

    if (users.length === 0) {
      return res.json({ success: false, message: "Email not found" });
    }

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
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset your Juno Calendar password",
        text: emailText,
      },
      (err2) => {
        if (err2) {
          return res.json({ success: false, message: "Failed to send email" });
        }

        console.log("Reset code sent:", code);
        return res.json({ success: true, message: "Code sent", code });
      }
    );
  });
}

//Reset password function
function resetPassword(req, res) {
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
}

//Send mail function
function sendMail(req, res) {
  const { email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    // Prepare emails
    const mailToAdmin = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Juno Calendar Help Request",
      text: `Message from ${email}:\n\n${message}`,
    };

    const mailToUser = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "We received your message",
      text: "Thank you for contacting Juno Calendar! We received your message and will get back to you soon.",
    };

    // Send to admin first
    transporter.sendMail(mailToAdmin, (err1, info1) => {
      if (err1) {
        console.error("Error sending to admin:", err1);
        return res
          .status(500)
          .json({ success: false, message: "Failed to send to admin" });
      }

      // Then send confirmation to user
      transporter.sendMail(mailToUser, (err2, info2) => {
        if (err2) {
          console.error("Error sending to user:", err2);
          return res.status(500).json({
            success: false,
            message: "Sent to admin, but failed to notify user",
          });
        }

        res.json({
          success: true,
          message: "Message sent to admin and confirmation sent to user",
          infoAdmin: info1,
          infoUser: info2,
        });
      });
    });
  });
}

module.exports = {
  signUp,
  login,
  getSession,
  logout,
  getEmail,
  sendResetCode,
  resetPassword,
  sendMail,
};
