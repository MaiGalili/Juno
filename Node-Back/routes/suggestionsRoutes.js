//suggestionsRoutes.js
const router = require("express").Router();
const suggestionController = require("../controllers/suggestionController");

router.post("/tasks/suggestions", suggestionController.getSuggestions);

module.exports = router;
