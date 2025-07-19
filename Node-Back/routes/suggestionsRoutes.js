const express = require("express");
const router = express.Router();
const { getSuggestions } = require("../controllers/suggestionsController");

// Route for fetching suggested time slots
router.post("/suggestions", getSuggestions);

module.exports = router;
