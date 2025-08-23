//userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

router.get("/settings", userController.getUserSettings);
router.put("/settings", requireAuth, userController.updateSettings);

module.exports = router;
