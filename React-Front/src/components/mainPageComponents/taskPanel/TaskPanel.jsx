// TaskPanel.jsx
import React from "react";
import TaskCard from "./taskCard/TaskCard";
import styles from "./taskPanel.module.css";

// A list of tasks that are scheduled for a specific time and location
export default function TaskPanel() {
  const upcomingTasks = [
    {
      title: "Call with Alex",
      time: "14:00",
      location: "Office",
      priority: "high",
    },
    {
      title: "Buy groceries",
      time: "17:30",
      location: "Home",
      priority: "medium",
    },
  ];

  const unscheduledTasks = [
    { title: "Plan birthday", location: "Home", priority: "low" },
    { title: "Fix website bug", priority: "high" },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Upcoming</h3>
        {upcomingTasks.map((task, index) => (
          <TaskCard key={index} {...task} />
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Unscheduled</h3>
        {unscheduledTasks.map((task, index) => (
          <TaskCard key={index} {...task} />
        ))}
      </div>
    </div>
  );
}
