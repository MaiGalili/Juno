//LoginBox.jsx
import React, { useState } from "react";
import styles from "./loginBox.module.css";
import { useNavigate } from "react-router-dom";

export default function LoginBox({ onSwitch, setIsLoggin }) {
  //State for form inputs
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //State for error messages
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    server: "",
  });

  //Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setErrors({ email: "", password: "", server: "" }); // Clear previous errors

    try {
      const response = await fetch("http://localhost:8801/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        //Login successful
        setIsLoggin(data.userEmail); // Set the logged-in user's email
        navigate("/calendar"); //Redirect to calendar
      } else {

        // Handle specific error messages
        const msg = data.message.toLowerCase();

        if (msg.includes("user not found")) {
          setErrors((prev) => ({ ...prev, email: data.message }));
        } else if (msg.includes("incorrect")) {
          setErrors((prev) => ({ ...prev, password: data.message }));
        } else {
          setErrors((prev) => ({ ...prev, server: data.message }));
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        server: "Server error. Please try again later.",
      }));
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Let's Start</h1>

      {/* Email input field */}
      <div
        className={`${styles.inputWrapper} ${
          errors.email ? styles.inputErrorWrapper : ""
        }`}
      >
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="Email"
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      {/* Password input field */}
      <div
        className={`${styles.inputWrapper} ${
          errors.password ? styles.inputErrorWrapper : ""
        }`}
      >
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="Password"
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}
      </div>

      {/* Submit and switch-to-signup buttons */}
      <div className={styles.buttonRow}>
        <button className={styles.loginButton} type="submit">
          Log In
        </button>
        <button
          type="button"
          className={styles.signupButton}
          onClick={() => onSwitch("signup")}
        >
          Sign Up
        </button>
      </div>

      {/* Server-level error message */}
      {errors.server && <p className={styles.error}>{errors.server}</p>}

      {/* Switch to forgot password form */}
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
