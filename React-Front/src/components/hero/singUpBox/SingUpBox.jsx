import React, { useState } from "react";
import styles from "./singUpBox.module.css";

export default function SignUpBox({ onSwitch }) {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    retypePassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8801/manageLogin/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signUpForm.email,
          password: signUpForm.password,
          repeatPassword: signUpForm.retypePassword,
        }),
      });

      const data = await response.json();

      alert(data.message);

      if (data.success) {
        onSwitch("login"); // מעבר למסך התחברות
      }
    } catch (err) {
      console.error("Error during sign up:", err);
      alert("אירעה שגיאה בעת ניסיון ההרשמה. נסי שוב מאוחר יותר.");
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
          value={signUpForm.email}
          onChange={(e) =>
            setSignUpForm({ ...signUpForm, email: e.target.value })
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
          value={signUpForm.password}
          onChange={(e) =>
            setSignUpForm({ ...signUpForm, password: e.target.value })
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
          value={signUpForm.retypePassword}
          onChange={(e) =>
            setSignUpForm({ ...signUpForm, retypePassword: e.target.value })
          }
          className={styles.input}
        />
      </div>

      <div className={styles.buttonRow}>
        <button className={styles.signUpButton} type="submit">
          Sign Up
        </button>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => onSwitch("login")}
        >
          Back to Log in
        </button>
      </div>
    </form>
  );
}
