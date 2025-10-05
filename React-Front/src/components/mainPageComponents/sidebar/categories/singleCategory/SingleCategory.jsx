import React, { useState } from "react";
import styles from "./singleCategory.module.css";
import ConfirmModal from "../../../../ConfirmModal";

export default function SingleCategory({
  id,
  name,
  color = "#ccc",
  onEdit,
  onDelete,
  onColorChange,
}) {
  const [showMenu, setShowMenu] = useState(false);

  // inline rename state
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState("");

  // confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  const openConfirm = (message, actionFn) => {
    setConfirmMsg(message);
    setConfirmAction(() => actionFn);
    setConfirmOpen(true);
  };
  const closeConfirm = () => setConfirmOpen(false);

  // ---- rename flow ----
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
  const saveEdit = () => {
    const trimmed = (draft || "").trim();
    if (!trimmed || trimmed === name) return cancelEdit();

    openConfirm(`Rename "${name}" to "${trimmed}"?`, async () => {
      try {
        await onEdit(id, trimmed);
        setIsEditing(false);
      } catch (e) {
        // keep the editor open and show the error
        setError(e?.message || "Could not rename");
      } finally {
        closeConfirm();
      }
    });
  };

  // ---- delete flow ----
  const handleDelete = () => {
    setShowMenu(false);
    openConfirm(`Remove category "${name}"?`, async () => {
      try {
        await onDelete(id);
      } finally {
        closeConfirm();
      }
    });
  };

  // ---- color change flow ----
  const handlePickColor = (newColor) => {
    setShowMenu(false);
    if (!newColor || newColor === color) return;
    openConfirm(`Change color of "${name}"?`, async () => {
      try {
        await onColorChange(id, newColor);
      } finally {
        closeConfirm();
      }
    });
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