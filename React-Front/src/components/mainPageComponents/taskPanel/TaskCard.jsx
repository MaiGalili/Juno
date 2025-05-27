import React from "react";
import styles from "./taskCard.module.css";

export default function TaskCard({
  title,
  time,
  location,
  priority = "normal",
}) {
  return (
    <div className={`${styles.card} ${styles[priority]}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.details}>
        {time && <span>{time}</span>}
        {location && <span>• {location}</span>}
      </div>
    </div>
  );
}
