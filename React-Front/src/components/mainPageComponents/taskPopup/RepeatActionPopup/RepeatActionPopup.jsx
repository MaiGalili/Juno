//components/mainPageComponents/taskPopup/RepeatActionPopup/RepeatActionPopup.jsx
import React from "react";
import styles from "./repeatActionPopup.module.css";

export default function RepeatActionPopup({
  open,
  onClose,
  onSelect,
  actionType = "delete",
  taskTitle = "",
}) {
  if (!open) return null; // Do not mount anything when closed

  const actionText = actionType === "delete" ? "delete" : "edit";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>
          {/* Optional task title for user context */}
          {actionType === "delete"
            ? "Delete Recurring Task"
            : "Edit Recurring Task"}
        </h3>
        {taskTitle && <p className={styles.title}>{taskTitle}</p>}

        <p className={styles.text}>
          This task is part of a repeating series.
          <br />
          What would you like to {actionText}?
        </p>

        {/* Emit scope to parent; parent decides how to call the API */}
        <div className={styles.btnGroup}>
          <button
            className={styles.single}
            onClick={() => onSelect("ONE")}
            autoFocus
          >
            Only this task
          </button>
          <button className={styles.future} onClick={() => onSelect("FUTURE")}>
            This and future tasks
          </button>
          <button className={styles.all} onClick={() => onSelect("ALL")}>
            All tasks in series
          </button>
        </div>

        {/* Passive close (no action taken) */}
        <button className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
