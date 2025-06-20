// HelpForm.jsx

import React, { useState } from "react";
import styles from "./helpForm.module.css"; 

export default function HelpForm() {
  // State for user input: message and email
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  // Status message and type for displaying feedback
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // 'success' | 'error'

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page reload on form submission
    setStatusMessage(""); // Clear any previous message
    setStatusType("");

    try {
      // Step 1: Check if email exists in the database
      const response = await fetch("http://localhost:8801/api/auth/getEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        setStatusMessage("Email not found.");
        setStatusType("error");
        return;
      }

      // Step 2: Send the help message to the server
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
        setStatusMessage("Message has been sent successfully.");
        setStatusType("success");
        setMessage("");
        setEmail("");
      } else {
        setStatusMessage("Error. Message has not been sent.");
        setStatusType("error");
      }
    } catch (error) {
      setStatusMessage("Error. Message has not been sent.");
      setStatusType("error");
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Section header */}
      <h3 className={styles.title}>
        Didn’t find what you were looking for?
        <br />
        We’re here to help!
      </h3>

      {/* Help message form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Textarea for user message */}
        <textarea
          className={styles.textarea}
          placeholder="Share your thoughts"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        {/* Input for user's email */}
        <input
          type="email"
          className={styles.input}
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Submit button */}
        <button type="submit" className={styles.button}>
          Send
        </button>

        {/* Status message shown below the button */}
        {statusMessage && (
          <p
            className={
              statusType === "success"
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}
