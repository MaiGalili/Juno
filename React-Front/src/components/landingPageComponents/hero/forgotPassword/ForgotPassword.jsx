import React, { useState } from "react";
import styles from "./forgotPassword.module.css";

export default function ForgotPassword({ onSwitch }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [realCode, setRealCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({ error: "", successMessage: "" });

  const handleSendCode = async () => {
    setMessage({ error: "", successMessage: "" });
    try {
      const res = await fetch("http://localhost:8801/api/auth/sendResetCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Response from server:", data);

      if (data.success) {
        setRealCode(data.code);
        setStep(2);
      } else {
        setMessage({
          error: data.message || "Error sending reset code",
          successMessage: "",
        });
      }
    } catch (err) {
      console.error("Error sending reset code:", err);
      setMessage({ error: "Network error", successMessage: "" });
    }
  };

  const handleVerifyCode = () => {
    setMessage({ error: "", successMessage: "" });
    if (code === realCode) {
      setStep(3);
    } else {
      setMessage({ error: "Invalid code", successMessage: "" });
    }
  };

  const handleResetPassword = async () => {
    setMessage({ error: "", successMessage: "" });

    if (password !== confirmPassword) {
      return setMessage({
        error: "Passwords do not match",
        successMessage: "",
      });
    }

    try {
      const res = await fetch("http://localhost:8801/api/auth/resetPassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Reset response:", data);

      if (data.success) {
        setMessage({
          error: "",
          successMessage: "Password reset successfully",
        });
        setTimeout(() => onSwitch("login"), 2000);
      } else {
        setMessage({
          error: data.message || "Error resetting password",
          successMessage: "",
        });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setMessage({ error: "Network error", successMessage: "" });
    }
  };

  return (
    <div className={styles.forgotPasswordBox}>
      <h2 className={styles.title}>Reset Password</h2>

      {message.error && <p className={styles.error}>{message.error}</p>}
      {message.successMessage && (
        <p className={styles.successMessage}>{message.successMessage}</p>
      )}

      {step === 1 && (
        <>
          <div className={styles.textField}>
            <input
              className={styles.inputEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <button className={styles.sendCodeButton} onClick={handleSendCode}>
            <span className={styles.labelText}>Send Code</span>
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className={styles.textField}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Code Received In Mail"
              className={styles.inputEmail}
            />
          </div>
          <button className={styles.sendCodeButton} onClick={handleVerifyCode}>
            <span className={styles.labelText}>Verify Code</span>
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div className={styles.textField}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className={styles.inputEmail}
            />
          </div>
          <div className={styles.textField}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className={styles.inputEmail}
            />
          </div>
          <button
            className={styles.sendCodeButton}
            onClick={handleResetPassword}
          >
            <span className={styles.labelText}>Reset Password</span>
          </button>
        </>
      )}

      <button className={styles.backButton} onClick={() => onSwitch("login")}>
        <span className={styles.labelText}>Back to Login</span>
      </button>
    </div>
  );
}
