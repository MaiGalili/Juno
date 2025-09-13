//userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

// Get user settings
router.get("/settings", userController.getUserSettings);
// Update user settings
router.put("/settings", requireAuth, userController.updateSettings);

module.exports = router;
