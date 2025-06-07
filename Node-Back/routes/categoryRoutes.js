const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoriesController");

// שליפת כל הקטגוריות של המשתמש המחובר (מבוסס session)
router.get("/", categoryController.getCategories);

// הוספת קטגוריה חדשה
router.post("/", categoryController.addCategory);

// מחיקת קטגוריה לפי שם (ומזהים לפי session)
router.delete("/:category_name", categoryController.deleteCategory);

// עדכון קטגוריה (שם וצבע)
router.put("/", categoryController.updateCategory);

module.exports = router;
