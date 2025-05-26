import React, { useState } from "react";
import styles from "./singUpBox.module.css";

export default function SignUpBox({ onSwitch }) {
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    retypePassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    retypePassword: "",
    server: "",
  });

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm({ ...signUpForm, [name]: value });
    setErrors({ ...errors, [name]: "", server: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(signUpForm.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const password = signUpForm.password;

    // Length check
    if (password.length < 8 || password.length > 20) {
      newErrors.password = "Password must be between 8 and 20 characters.";
    }

    // Letter check (must contain at least one a-z or A-Z)
    else if (!/[a-zA-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one letter.";
    }

    // Digit check (must contain at least one number)
    else if (!/\d/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
    }

    if (signUpForm.password !== signUpForm.retypePassword) {
      newErrors.retypePassword = "Passwords do not match.";
    }

    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", retypePassword: "", server: "" });
    setSuccess("");

    if (!validateForm()) return;

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

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          onSwitch("login");
        }, 2000);
      } else {
        // If server message is related to existing user, attach to email error
        if (
          data.message.toLowerCase().includes("already exists") ||
          data.message.toLowerCase().includes("כבר קיים")
        ) {
          setErrors({ ...errors, email: data.message });
        } else {
          setErrors({ ...errors, server: data.message });
        }
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      setErrors({ ...errors, server: "Server error. Please try again later." });
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Create Account</h1>

      <div
        className={`${styles.inputWrapper} ${
          errors.email ? styles.inputErrorWrapper : ""
        }`}
      >
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={signUpForm.email}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      <div
        className={`${styles.inputWrapper} ${
          errors.password ? styles.inputErrorWrapper : ""
        }`}
      >
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          value={signUpForm.password}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}
      </div>

      <div
        className={`${styles.inputWrapper} ${
          errors.retypePassword ? styles.inputErrorWrapper : ""
        }`}
      >
        <input
          type="password"
          name="retypePassword"
          autoComplete="new-password"
          placeholder="Retype Password"
          value={signUpForm.retypePassword}
          onChange={handleChange}
          className={styles.input}
        />
        {errors.retypePassword && (
          <p className={styles.error}>{errors.retypePassword}</p>
        )}
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

      {errors.server && <p className={styles.error}>{errors.server}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
}
