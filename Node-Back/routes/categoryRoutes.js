//categoryRoutes.js
const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoriesController");

// Get all categories
router.get("/", categoryController.getCategories);

// Add a new category
router.post("/", categoryController.addCategory);

// Delete a category
router.delete("/:category_id", categoryController.deleteCategory);

// Update a category
router.put("/", categoryController.updateCategory);

module.exports = router;
