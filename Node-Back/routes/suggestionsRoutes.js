//suggestionsRoutes.js
const router = require("express").Router();
const suggestionController = require("../controllers/suggestionController");

// Get suggestions
router.post("/suggestions", suggestionController.getSuggestions);

module.exports = router;
