//authRoutes.js

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Sign up
router.post("/signUp", authController.signUp);

// Login
router.post("/login", authController.login);

// Get session
router.get("/getSession", authController.getSession);

// Logout
router.post("/logout", authController.logout);

// Reset password
router.post("/getEmail", authController.getEmail);
router.post("/sendResetCode", authController.sendResetCode);
router.put("/resetPassword", authController.resetPassword);
router.post("/sendMail", authController.sendMail);

module.exports = router;
