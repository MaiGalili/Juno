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
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
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
    };

    try {
      console.log(newCategory);
      const response = await fetch("http://localhost:8801/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories([...categories, createdCategory]);
        setNewCategoryName("");
        setNewCategoryColor("#dddddd");
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await fetch(`http://localhost:8801/api/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setCategories(categories.filter((c) => c.category_id !== categoryId));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleEdit = async (categoryId) => {
    const current = categories.find((c) => c.category_id === categoryId);
    const newName = prompt("Enter new name:", current.name);
    if (!newName) return;

    try {
      await fetch("http://localhost:8801/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category_id: categoryId,
          new_name: newName,
          new_color: current.color,
          user_email: userEmail,
        }),
      });

      setCategories(
        categories.map((c) =>
          c.category_id === categoryId ? { ...c, name: newName } : c
        )
      );
    } catch (err) {
      console.error("Error editing category:", err);
    }
  };

  const handleColorChange = async (categoryId, newColor) => {
    const current = categories.find((c) => c.category_id === categoryId);
    if (!current) return;

    try {
      await fetch("http://localhost:8801/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category_id: categoryId,
          new_name: current.name,
          new_color: newColor,
          user_email: userEmail,
        }),
      });

      setCategories(
        categories.map((c) =>
          c.category_id === categoryId ? { ...c, color: newColor } : c
        )
      );
    } catch (err) {
      console.error("Error changing category color:", err);
    }
  };

  return (
    <div className={styles.wrapper}>
      <ul className={styles.labelList}>
        {categories.map((category) => (
          <SingleCategory
            key={category.category_id}
            id={category.category_id}
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
