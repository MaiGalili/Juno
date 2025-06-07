const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoriesController");

router.get("/", categoryController.getCategories);
router.post("/", categoryController.addCategory);
router.delete("/:category_name", categoryController.deleteCategory);
router.put("/", categoryController.updateCategory);

module.exports = router;
