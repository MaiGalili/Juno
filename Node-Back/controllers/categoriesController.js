const db = require("../db");

// === Get Categories ===
async function getCategories(req, res) {
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

    res.json(results);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
}

// === Add Category ===
async function addCategory(req, res) {
  const user_email = req.body.user_email || req.session.userEmail;
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

// === Delete Category ===
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

// === Update Category ===
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

module.exports = {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
};
