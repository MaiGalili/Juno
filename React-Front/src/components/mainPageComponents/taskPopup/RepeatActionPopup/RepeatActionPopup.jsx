import React from "react";
import styles from "./repeatActionPopup.module.css";

export default function RepeatActionPopup({
  open,
  onClose,
  onSelect,
  actionType = "delete",
  taskTitle = "",
}) {
  if (!open) return null;

  const actionText = actionType === "delete" ? "delete" : "edit";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>
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
        <button className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
