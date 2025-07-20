// categoriesController.js
const db = require("../db");

// Get categories function
async function getCategories(req, res) {
  // Get user email from session
  const user_email = req.session.userEmail;

  if (!user_email) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const [results] = await db
      .promise()
      .query(
        "SELECT category_id, category_name AS name, category_color AS color FROM category WHERE user_email = ?",
        [user_email]
      );

    // Send list of categories as response
    res.json(results);

  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
}

// Add category function
async function addCategory(req, res) {
  const user_email = req.session.userEmail;
  const { category_name, category_color } = req.body;

  if (!user_email || !category_name) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    const insertQuery = `
      INSERT INTO category (category_name, category_color, user_email)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE category_color = VALUES(category_color)
    `;

    // Insert or update category color if the name already exists
    await db
      .promise()
      .query(insertQuery, [category_name, category_color, user_email]);

    // Fetch and return the newly added/updated category
    const [newCategoryRows] = await db.promise().query(
      `SELECT category_id, category_name AS name, category_color AS color
       FROM category
       WHERE category_name = ? AND user_email = ?`,
      [category_name, user_email]
    );

    res.status(201).json(newCategoryRows[0]);
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Failed to add category" });
  }
}

// Delete category function
async function deleteCategory(req, res) {
  const user_email = req.session.userEmail;
  const { category_id } = req.params;

  if (!user_email || !category_id) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    await db
      .promise()
      .query("DELETE FROM category WHERE category_id = ?", [category_id]);

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category" });
  }
}

// Update category function
async function updateCategory(req, res) {
  const user_email = req.body.user_email || req.session.userEmail;
  const { category_id, new_name, new_color } = req.body;

  if (!user_email || !category_id || !new_name) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    await db
      .promise()
      .query(
        "UPDATE category SET category_name = ?, category_color = ? WHERE category_id = ?",
        [new_name, new_color, category_id]
      );

    res.json({ success: true, message: "Category updated" });
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update category" });
  }
}

// Get all categories for a user
async function getAllCategories(req, res) {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ success: false, message: "Missing user email" });
    }

    const [rows] = await db.promise().query(
      "SELECT category_id, category_name FROM categories WHERE email = ?",
      [userEmail]
    );

    return res.json({ success: true, categories: rows });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
}

module.exports = {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  getAllCategories,
};
