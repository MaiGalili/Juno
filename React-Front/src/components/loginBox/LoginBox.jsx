import React, { useState } from "react";
import styles from "./loginBox.module.css";

export default function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Let's Start</h1>

      <div className={styles.inputWrapper}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="Email"
        />
        {email && (
          <button
            className={styles.clearButton}
            onClick={() => setEmail("")}
            aria-label="Clear email"
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="Password"
        />
        {password && (
          <button
            className={styles.clearButton}
            onClick={() => setPassword("")}
            aria-label="Clear password"
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="Password"
        />
        {password && (
          <button
            className={styles.clearButton}
            onClick={() => setPassword("")}
            aria-label="Clear password"
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.buttonRow}>
        <button className={styles.loginButton}>Log In</button>
        <button className={styles.signupButton}>Sign Up</button>
      </div>

      <div className={styles.forgotPassword}>Forgot Password</div>
    </div>
  );
}
