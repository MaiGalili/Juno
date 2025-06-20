//Hero.jsx
import React, { useState } from "react";
import styles from "./hero.module.css";
import Login from "./loginBox/LoginBox";
import SignUp from "./singUpBox/SingUpBox";
import ForgotPassword from "./forgotPassword/ForgotPassword";

export default function Hero({ setIsLoggin }) {
  // Controls which form to display: "login", "signup", or "forgot"
  const [formType, setFormType] = useState("login");

  //Dynamically renders the form based on the current formType
  const renderForm = () => {
    switch (formType) {
      case "signup":
        return <SignUp onSwitch={setFormType} />;
      case "forgot":
        return <ForgotPassword onSwitch={setFormType} />;
      default:
        return <Login onSwitch={setFormType} setIsLoggin={setIsLoggin} />;
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.imagePlaceholder}>placeholder</div>

      <div className={styles.bottomSection}>
        <div className={styles.leftText}>
          <h2>
            <strong>Hey, busy human!</strong>
          </h2>
          <p>
            Juno helps you fit your tasks into your day based on where you are,
            how long things take, and what goes well together.
            <br />
            Less stress, more done.
          </p>
        </div>

        {/* Form section (login, signup, or forgot password) */}
        <div className={styles.rightForm}>{renderForm()}</div>
      </div>
    </section>
  );
}
