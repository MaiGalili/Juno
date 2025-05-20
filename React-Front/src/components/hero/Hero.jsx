import React, { useState } from "react";
import styles from "./hero.module.css";
import Login from "./loginBox/LoginBox";
import SignUp from "./singUpBox/SingUpBox";
import ForgotPassword from "./forgotPassword/ForgotPassword";

export default function Hero() {
  const [formType, setFormType] = useState("login");

  const renderForm = () => {
    switch (formType) {
      case "signup":
        return <SignUp onSwitch={setFormType} />;
      case "forgot":
        return <ForgotPassword onSwitch={setFormType} />;
      default:
        return <Login onSwitch={setFormType} />;
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

        <div className={styles.rightForm}>{renderForm()}</div>
      </div>
    </section>
  );
}
