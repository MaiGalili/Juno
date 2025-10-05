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
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState("");

  const startEdit = () => {
    setShowMenu(false);
    setDraft(name);
    setError("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(name);
    setError("");
  };

  const saveEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) return cancelEdit();
    try {
      await onEdit(id, trimmed);
      setIsEditing(false);
    } catch (e) {
      setError(e?.message || "Could not rename");
    }
  };

  return (
    <li className={styles.categoryItem} style={{ backgroundColor: color }}>
      {!isEditing ? (
        <>
          <span
            className={styles.name}
            title="Double-click to rename"
            onDoubleClick={startEdit}
          >
            {name}
          </span>
          <button
            className={styles.menuButton}
            onClick={() => setShowMenu((p) => !p)}
          >
            ⋮
          </button>

          {showMenu && (
            <div className={styles.dropdownMenu}>
              <label className={styles.colorOption}>
                CATEGORY COLOR
                <input
                  type="color"
                  onChange={(e) => {
                    setShowMenu(false);
                    onColorChange(id, e.target.value);
                  }}
                />
              </label>
              <button onClick={startEdit}>Edit</button>
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
        </>
      ) : (
        <div className={styles.inlineEditor}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
          />
          <button className={styles.saveBtn} onClick={saveEdit}>
            Save
          </button>
          <button className={styles.cancelBtn} onClick={cancelEdit}>
            Cancel
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}
    </li>
  );
}