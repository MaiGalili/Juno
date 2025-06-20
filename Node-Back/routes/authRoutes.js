//authRoutes.js
//Import required modules
const express = require("express");
const router = express.Router();

// Import the authentication controller that handles logic for each auth-related route
const authController = require("../controllers/authController");

// === AUTH ROUTES ===

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
