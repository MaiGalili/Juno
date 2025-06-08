import React, { useState } from "react";
import styles from "./helpForm.module.css";

export default function HelpForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8801/api/auth/getEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!result.success) {
        alert("Email not found");
        return;
      }

      const mailResponse = await fetch(
        "http://localhost:8801/api/auth/sendMail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message }),
        }
      );

      const mailResult = await mailResponse.json();
      if (mailResult.success) {
        alert("Message sent!");
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error:", error);
    }
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
