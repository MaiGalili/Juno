// SingleLocation.jsx
import React, { useState } from "react";
import styles from "./singleLocation.module.css";

export default function SingleLocation({
  id,
  name,
  color = "#ccc",
  icon,
  onEdit,
  onDelete,
  onColorChange,
  onIconChange,
}) {
  // Controls visibility of the dropdown menu
  const [showMenu, setShowMenu] = useState(false);

  // Toggle the dropdown menu
  const toggleMenu = () => setShowMenu((prev) => !prev);

  return (
    <li className={styles.labelItem} style={{ backgroundColor: color }}>
      {/* Display the location icon and name */}
      <span className={styles.name}>
        {icon} {name}
      </span>
      {/* Button to toggle the dropdown menu (three-dot icon) */}
      <button className={styles.menuButton} onClick={toggleMenu}>
        ⋮
      </button>

      {/* Dropdown menu for icon/color selection, editing, and deleting */}
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

          <label className={styles.iconOption}>
            🎨 LOCATION COLOR
            <input
              type="color"
              value={color}
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

          {/* Delete button */}
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
