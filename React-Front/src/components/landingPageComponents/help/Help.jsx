// Help.jsx
import React from "react";
import styles from "./help.module.css";
import HelpForm from "./helpForm/HelpForm";

export default function Help() {
  return (
    // Wrapper section for the help page
    <section className={styles.helpSection}>
      {/* Title and introductory text */}
      <h2 className={styles.title}>Need Help?</h2>
      <p className={styles.subtitle}>
        Here’s everything you need to know to get started with Juno and make the
        most of your day.
      </p>

      <div className={styles.faqItem}>
        <h4>How does Juno schedule my tasks?</h4>
        <p>
          Juno considers your task duration, current location, and travel time
          to find the best time slots in your day.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h4>Can I manually adjust tasks after they’re suggested?</h4>
        <p>
          Yes! You have full control—Juno makes suggestions, but you can drag,
          drop, and edit anytime.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h4>What types of tasks work best with Juno?</h4>
        <p>
          From quick errands to long meetings, Juno handles all kinds of tasks.
          It’s especially useful when your day involves multiple locations.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h4>Does Juno track my location in real time?</h4>
        <p>
          No. Juno uses your preferred or last known location to suggest smart
          scheduling, but it doesn’t track where you live.
        </p>
      </div>

      <div className={styles.faqItem}>
        <h4>Is my data private and secure?</h4>
        <p>
          Absolutely. Your information is encrypted and never shared. Privacy is
          core to how we build.
        </p>
      </div>
      {/* Contact/help request form */}
      <HelpForm />
    </section>
  );
}
