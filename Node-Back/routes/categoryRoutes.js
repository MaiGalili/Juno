//categoryRoutes.js
//Import required modules
const express = require("express");
const router = express.Router();

// Import the category controller that handles the logic for each route
const categoryController = require("../controllers/categoriesController");

// === ROUTES ===

// Get all categories
router.get("/", categoryController.getCategories);

// Add a new category
router.post("/", categoryController.addCategory);

// Delete a category
router.delete("/:category_id", categoryController.deleteCategory);

// Update a category
router.put("/", categoryController.updateCategory);

module.exports = router;
