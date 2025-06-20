// ConfirmModal.jsx
import React from "react";
import styles from "./confirmModal.module.css";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    // Overlay to darken background and center modal
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>{message}</p>

        {/* Action buttons */}
        <div className={styles.buttons}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}
