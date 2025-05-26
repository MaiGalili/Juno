import React, { useState } from "react";
import styles from "./loginBox.module.css";
import { useNavigate } from "react-router-dom";

export default function LoginBox({ onSwitch, setIsLoggin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const rsulte = await fetch("http://localhost:8801/manageLogin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await rsulte.json();
      setError(data.message);
      if (data.success) {
        setIsLoggin(true);
        navigate("/calendar");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("אירעה שגיאה בעת ניסיון התחברות. נסי שוב מאוחר יותר.");
    }
  };
  console.log(error);
  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Let's Start</h1>
      {error && (
        <p
          className={styles.error}
          onClick={(e) => {
            if (e.target.textContent === "✕" || e.target.textContent === error)
              setError("");
          }}
        >
          {error}
        </p>
      )}
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

      <div className={styles.buttonRow}>
        <button className={styles.loginButton}>Log In</button>
        <button
          className={styles.signupButton}
          onClick={() => onSwitch("signup")}
        >
          Sign Up
        </button>
      </div>

      <div
        className={styles.forgotPassword}
        onClick={() => onSwitch("forgot")}
        style={{ cursor: "pointer" }}
      >
        Forgot Password
      </div>
    </form>
  );
}
