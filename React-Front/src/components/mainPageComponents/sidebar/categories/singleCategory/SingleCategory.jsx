import React, { useState } from "react";
import styles from "./singleCategory.module.css";

export default function SingleCategory({
  id,
  name,
  color = "#ccc",
  onEdit,
  onDelete,
  onColorChange,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  return (
    <li className={styles.categoryItem} style={{ backgroundColor: color }}>
      <span className={styles.name}>{name}</span>
      <button className={styles.menuButton} onClick={toggleMenu}>
        ⋮
      </button>

      {showMenu && (
        <div className={styles.dropdownMenu}>
          <label className={styles.colorOption}>
            🎨 CATEGORY COLOR
            <input
              type="color"
              onChange={(e) => {
                setShowMenu(false);
                onColorChange(id, e.target.value);
              }}
            />
          </label>
          <button
            onClick={() => {
              setShowMenu(false);
              onEdit(id);
            }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              onDelete(id);
            }}
          >
            Remove Category
          </button>
        </div>
      )}
    </li>
  );
}
