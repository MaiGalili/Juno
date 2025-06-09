import React, { useState } from "react";
import styles from "./singleLocation.module.css";

export default function SingleLocation({
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
    <li className={styles.labelItem} style={{ backgroundColor: color }}>
      <span className={styles.name}>{name}</span>
      <button className={styles.menuButton} onClick={toggleMenu}>
        ⋮
      </button>

      {showMenu && (
        <div className={styles.dropdownMenu}>
          <label className={styles.iconOption}>
            🏷️ LOCATION ICON
            <select
              defaultValue={icon}
              onChange={(e) => {
                setShowMenu(false);
                onIconChange(id, e.target.value);
              }}
            >
              <option value="📍">📍</option>
              <option value="🏠">🏠</option>
              <option value="🚗">🚗</option>
              <option value="🖥️">🖥️</option>
              <option value="🏢">🏢</option>
            </select>
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
            Remove label
          </button>
        </div>
      )}
    </li>
  );
}
