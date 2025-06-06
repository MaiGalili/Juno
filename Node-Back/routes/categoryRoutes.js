const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoriesController");

router.get("/:email", categoryController.getCategories);
router.post("/", categoryController.addCategory);
router.delete("/:category_name/:email", categoryController.deleteCategory);
router.put("/", categoryController.updateCategory);

module.exports = router;
