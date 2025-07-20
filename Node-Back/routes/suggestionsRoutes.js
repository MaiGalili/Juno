// Import required modules
const express = require("express");
const router = express.Router();

// Import the suggestions controller
const suggestionsController = require("../controllers/suggestionsController");

// === ROUTES ===
// Generate task suggestions
router.post("/", suggestionsController.getSuggestions);

module.exports = router;
