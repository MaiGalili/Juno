const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

async function signUp(req, res) {
  const { email, password } = req.body;

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db
      .promise()
      .query("INSERT INTO users (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);

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

      const isMatch = await bcrypt.compare(password, result[0].password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Incorrect username or password.",
        });
      }

      req.session.userEmail = email;
      console.log("Session created after login:", req.session);

      return res.json({ success: true, message: "Login successful" });
    }
  );
}

function getSession(req, res) {
  const userEmail = req.session.userEmail;
  if (userEmail) {
    return res.json({ success: true, userEmail });
  } else {
    return res.json({ success: false, message: "No session found" });
  }
}

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

function sendResetCode(req, res) {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "junocalendar2025@gmail.com",
      pass: "ygnp yhoi jrwo hppz",
    },
  });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err) return;
    res.json({ success: false, message: "Server error" });
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
      (err2) => {
        if (err2)
          return res.json({ success: false, message: "Failed to send email" });
        res.json({ success: true, message: "Code sent", code });
      }
    );
  });
}

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

module.exports = {
  signUp,
  login,
  getSession,
  logout,
  getEmail,
  sendResetCode,
  resetPassword,
};
