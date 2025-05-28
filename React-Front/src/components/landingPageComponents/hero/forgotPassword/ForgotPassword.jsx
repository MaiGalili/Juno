import React, { useState } from "react";

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
    const res = await fetch("http://localhost:8801/manageLogin/sendResetCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      setRealCode(data.code);
      setStep(2);
    } else {
      setMessage({ error: data.message, successMessage: "" });
    }
  };

  const handleVerifyCode = () => {
    setMessage({ error: "", successMessage: "" });
    if (code === realCode) {
      setStep(3);
    } else {
      setMessage({ error: "הקוד שגוי", successMessage: "" });
    }
  };

  const handleResetPassword = async () => {
    setMessage({ error: "", successMessage: "" });
    if (password !== confirmPassword) {
      return setMessage({ error: "הסיסמאות לא תואמות", successMessage: "" });
    }
    const res = await fetch("http://localhost:8801/manageLogin/resetPassword", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ error: "", successMessage: "הסיסמה אופסה בהצלחה" });
      setTimeout(() => onSwitch("login"), 2000);
    } else {
      setMessage({ error: data.message, successMessage: "" });
    }
  };

  return (
    <div className="forgotPasswordBox">
      <h2 className="title">איפוס סיסמה</h2>
      {message.error && <p className="error">{message.error}</p>}
      {message.successMessage && (
        <p className="successMessage">{message.successMessage}</p>
      )}

      {step === 1 && (
        <>
          <div className="textField">
            <input
              className="inputEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <button className="sendCodeButton" onClick={handleSendCode}>
            <span className="labelText">שלח קוד</span>
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="textField">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="הזן קוד שקיבלת במייל"
              className="inputEmail"
            />
          </div>
          <button className="sendCodeButton" onClick={handleVerifyCode}>
            <span className="labelText">אמת קוד</span>
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="textField">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה חדשה"
              className="inputEmail"
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$"
            />
          </div>
          <div className="textField">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="אימות סיסמה"
              className="inputEmail"
              pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$"
            />
          </div>
          <button className="sendCodeButton" onClick={handleResetPassword}>
            <span className="labelText">אפס סיסמה</span>
          </button>
        </>
      )}

      <button className="backButton" onClick={() => onSwitch("login")}>
        <span className="labelText">חזרה להתחברות</span>
      </button>
    </div>
  );
}
