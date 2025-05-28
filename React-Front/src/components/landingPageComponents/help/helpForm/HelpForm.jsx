import React, { useState } from "react";
import styles from "./helpForm.module.css";

export default function HelpForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
 
    console.log("Message:", message);
    console.log("Email:", email);
   
    setMessage("");
    setEmail("");
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>
        Didn’t find what you were looking for?
        <br />
        We’re here to help!
      </h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          className={styles.textarea}
          placeholder="Share your thoughts"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <input
          type="email"
          className={styles.input}
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
}
