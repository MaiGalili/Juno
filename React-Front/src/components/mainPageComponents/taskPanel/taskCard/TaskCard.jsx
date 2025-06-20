//TaskCard.jsx
import React from "react";
import styles from "./taskCard.module.css";

export default function TaskCard({
  title,
  time,
  location,
  priority = "normal",
}) {
  return (
    // The card element gets a dynamic class based on upcoming tasks
    <div className={`${styles.card} ${styles[priority]}`}>
      {/* Display the task title */}
      <div className={styles.title}>{title}</div>
      {/* Display time and location, if provided */}
      <div className={styles.details}>
        {time && <span>{time}</span>}
        {location && <span>• {location}</span>}
      </div>
    </div>
  );
}
