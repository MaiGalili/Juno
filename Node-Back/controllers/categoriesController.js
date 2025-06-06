const db = require("../db");

async function getCategories(req, res) {
  const { email } = req.params;

  try {
    const [results] = await db
      .promise()
      .query(
        "SELECT category_name AS name, category_color AS color FROM category WHERE user_email = ?",
        [email]
      );

    res.json(results);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
}

async function addCategory(req, res) {
  const { category_name, category_color, user_email } = req.body;

  try {
    const insertQuery = `
      INSERT INTO category (category_name, category_color, user_email)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE category_color = VALUES(category_color)
    `;

    await db
      .promise()
      .query(insertQuery, [category_name, category_color, user_email]);

    res
      .status(201)
      .json({ success: true, message: "Category added or updated" });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Failed to add category" });
  }
}

async function deleteCategory(req, res) {
  const { category_name, email } = req.params;

  try {
    await db
      .promise()
      .query(
        "DELETE FROM category WHERE category_name = ? AND user_email = ?",
        [category_name, email]
      );

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category" });
  }
}

async function updateCategory(req, res) {
  const { old_name, new_name, new_color, user_email } = req.body;

  try {
    await db
      .promise()
      .query(
        "UPDATE category SET category_name = ?, category_color = ? WHERE category_name = ? AND user_email = ?",
        [new_name, new_color, old_name, user_email]
      );

    res.json({ success: true, message: "Category updated" });
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update category" });
  }
}

module.exports = {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
};
