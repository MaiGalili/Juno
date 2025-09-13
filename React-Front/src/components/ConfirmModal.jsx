// components/ConfirmModal.jsx
import React from "react";
import styles from "./confirmModal.module.css";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    // Full-screen overlay; centers modal and prevents interaction with background
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Main prompt text */}
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
