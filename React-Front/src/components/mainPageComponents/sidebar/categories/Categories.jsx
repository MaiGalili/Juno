import React, { useEffect, useState } from "react";
import SingleCategory from "./singleCategory/SingleCategory";
import styles from "./categories.module.css";

export default function Categories({ userEmail }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#dddddd");

  useEffect(() => {
    fetch("http://localhost:8801/api/categories", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const handleAdd = async () => {
    const trimmed = newCategoryName.trim();
    if (
      !trimmed ||
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    )
      return;

    const newCategory = {
      category_name: trimmed,
      category_color: newCategoryColor,
      user_email: userEmail, // נוסף עבור שמירה נכונה
    };

    try {
      const response = await fetch("http://localhost:8801/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        setCategories([
          ...categories,
          { name: trimmed, color: newCategoryColor },
        ]);
        setNewCategoryName("");
        setNewCategoryColor("#dddddd");
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleDelete = async (categoryName) => {
    try {
      await fetch(`http://localhost:8801/api/categories/${categoryName}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCategories(categories.filter((c) => c.name !== categoryName));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleEdit = async (categoryName) => {
    const newName = prompt("Enter new name:", categoryName);
    if (!newName) return;

    const oldColor =
      categories.find((c) => c.name === categoryName)?.color || "#dddddd";

    try {
      await fetch("http://localhost:8801/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          old_name: categoryName,
          new_name: newName,
          new_color: oldColor,
          user_email: userEmail, // כדי לעדכן לפי המשתמש
        }),
      });

      setCategories(
        categories.map((c) =>
          c.name === categoryName ? { ...c, name: newName } : c
        )
      );
    } catch (err) {
      console.error("Error editing category:", err);
    }
  };

  const handleColorChange = async (categoryName, newColor) => {
    try {
      await fetch("http://localhost:8801/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          old_name: categoryName,
          new_name: categoryName,
          new_color: newColor,
          user_email: userEmail, // גם כאן
        }),
      });

      setCategories(
        categories.map((c) =>
          c.name === categoryName ? { ...c, color: newColor } : c
        )
      );
    } catch (err) {
      console.error("Error changing category color:", err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.labelList}>
        {categories.map((category, index) => (
          <SingleCategory
            key={index}
            name={category.name}
            color={category.color}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onColorChange={handleColorChange}
          />
        ))}
      </ul>

      <div className={styles.addForm}>
        <input
          type="text"
          placeholder="Add new category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <input
          type="color"
          value={newCategoryColor}
          onChange={(e) => setNewCategoryColor(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
