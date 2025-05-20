import React from "react";
import styles from "./forgotPassword.module.css";

export default function ForgotPassword({ onSwitch }) {
  return (
    <div className={styles.forgotPasswordBox}>
      <h1 className={styles.title}>Forgot Password?</h1>

      <div className={styles.textField}>
        <input
          type="email"
          id="email"
          placeholder="Email"
          className={styles.inputEmail}
        />
      </div>

      <button className={styles.sendCodeButton}>
        <span className={styles.labelText}>Send code to email</span>
      </button>

      <button className={styles.backButton} onClick={() => onSwitch("login")}>
        <span className={styles.labelText}>Back to Log in</span>
      </button>
    </div>
  );
}
