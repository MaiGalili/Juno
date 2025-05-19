import React from "react";
import styles from "./singUpBox.module.css";

const SignUp = () => {
  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.signupTitle}>Hello Newcomer!</h1>

      <div className={styles.textField}>
        <input
          type="email"
          className={styles.textInput}
          name="email"
          autoComplete="email"
          placeholder="Enter your email"
        />
      </div>

      <div className={styles.textField}>
        <input
          type="password"
          placeholder="Password"
          className={styles.textInput}
        />
      </div>

      <div className={styles.textField}>
        <input
          type="password"
          placeholder="Retype Password"
          className={styles.textInput}
        />
      </div>

      <button className={styles.signupButton}>Sign Up</button>
    </div>
  );
};

export default SignUp;
