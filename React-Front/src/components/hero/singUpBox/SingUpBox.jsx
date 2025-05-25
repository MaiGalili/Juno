import React, { useState } from "react";
import styles from "./singUpBox.module.css";

export default function SignUpBox({ onSwitch }) {
  const [signUpForm, setSingUpForm] = useState({
    email: "",
    password: "",
    retypePassword: "",
  });
  console.log(signUpForm);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8801/manageLogin/sinUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpForm),
      });
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error("Error during sign up:", err);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Create Account</h1>

      <div className={styles.inputWrapper}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          onChange={(e) =>
            setSingUpForm({ ...signUpForm, email: e.target.value })
          }
          className={styles.input}
        />
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          onChange={(e) =>
            setSingUpForm({ ...signUpForm, password: e.target.value })
          }
          className={styles.input}
        />
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="password"
          name="retype"
          autoComplete="new-password"
          placeholder="Retype Password"
          onChange={(e) =>
            setSingUpForm({ ...signUpForm, retypePassword: e.target.value })
          }
          className={styles.input}
        />
      </div>

      <div className={styles.buttonRow}>
        <button className={styles.signUpButton}>Sign Up</button>
        <button className={styles.backButton} onClick={() => onSwitch("login")}>
          Back to Log in
        </button>
      </div>
    </form>
  );
}
