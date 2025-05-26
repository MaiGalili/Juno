import React, { useState } from "react";
import styles from "./forgotPassword.module.css";

export default function ForgotPassword({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [move, setMove] = useState(false);
  const [error, setError] = useState("");

  const handleEmail = async () => {
    try {
      const result = await fetch("http://localhost:8801/manageLogin/getEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await result.json();
      if (data.success) {
        setMove(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error getting email:", error);
      setError("אירעה שגיאה בעת ניסיון איפוס הסיסמה. נסי שוב מאוחר יותר.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const result = await fetch(
        "http://localhost:8801/manageLogin/resetPassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await result.json();
      if (data.success) {
        onSwitch("login");
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("אירעה שגיאה בעת ניסיון איפוס הסיסמה. נסי שוב מאוחר יותר.");
    }
  };

  return (
    <div className={styles.forgotPasswordBox}>
      {!move ? (
        <div>
          <h1 className={styles.title}>Forgot Password?</h1>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.textField}>
            <input
              type="email"
              id="email"
              placeholder="Email"
              className={styles.inputEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className={styles.sendCodeButton} onClick={handleEmail}>
            <span className={styles.labelText}>Send code to email</span>
          </button>
        </div>
      ) : (
        <div>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleResetPassword}>
            <span>new password</span>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span>confirm password</span>
            <input
              type="password"
              placeholder="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleResetPassword}>
              <span className={styles.labelText}>Reset Password</span>
            </button>
            <button onClick={() => setMove(false)}>
              <span className={styles.labelText}>Back</span>
            </button>
          </form>
        </div>
      )}

      <button className={styles.backButton} onClick={() => onSwitch("login")}>
        <span className={styles.labelText}>Back to Log in</span>
      </button>
    </div>
  );
}
