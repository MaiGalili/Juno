import React, { useState } from "react";
import styles from "./singleLable.module.css";

export default function SingleLable({ name, color = "#ccc", onEdit, onDelete, onColorChange }) {
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
          <label className={styles.colorOption}>
            🎨 LABEL COLOR
            <input
              type="color"
              onChange={(e) => {
                setShowMenu(false);
                onColorChange(name, e.target.value);
              }}
            />
          </label>
          <button onClick={() => { setShowMenu(false); onEdit(name); }}>Edit</button>
          <button onClick={() => { setShowMenu(false); onDelete(name); }}>Remove label</button>
        </div>
      )}
    </li>
  );
}
