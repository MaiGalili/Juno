import React, { useState } from "react";
import styles from "./singUpBox.module.css";

export default function SignUpBox({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Account</h1>

      <div className={styles.inputWrapper}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="password"
          name="retype"
          autoComplete="new-password"
          placeholder="Retype Password"
          value={retypePassword}
          onChange={(e) => setRetypePassword(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.buttonRow}>
        <button className={styles.signUpButton}>Sign Up</button>
        <button className={styles.backButton} onClick={() => onSwitch("login")}>
          Back to Log in
        </button>
      </div>
    </div>
  );
}
