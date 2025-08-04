// TaskPanel.jsx
import React from "react";
import TaskCard from "./taskCard/TaskCard";
import styles from "./taskPanel.module.css";

// A list of tasks that are scheduled for a specific time and location
export default function TaskPanel({
  upcomingTasks = [],
  waitingTasks = [],
  onSelectTask,
}) {
  // Get the first three upcoming tasks
  const now = new Date();
  const threeUpcoming = [...upcomingTasks]
    .filter((task) => task.start && new Date(task.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 3);

  // sort waiting tasks
  const sortedWaiting = [...waitingTasks].sort((a, b) => {
    if (a.task_duedate < b.task_duedate) return -1;
    if (a.task_duedate > b.task_duedate) return 1;
    if ((a.task_duetime || "") < (b.task_duetime || "")) return -1;
    if ((a.task_duetime || "") > (b.task_duetime || "")) return 1;
    return 0;
  });
  console.log("waitingTasks", waitingTasks);

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Upcoming</h3>
        {threeUpcoming.length === 0 ? (
          <div className={styles.empty}>No upcoming tasks.</div>
        ) : (
          threeUpcoming.map((task) => (
            <div
              key={task.id || task.task_id}
              onClick={() => onSelectTask?.(task.raw || task)}
              style={{ cursor: "pointer" }}
            >
              <TaskCard
                title={task.title || task.task_title}
                time={
                  task.start && task.end
                    ? `${new Date(task.start).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}–${new Date(task.end).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : ""
                }
                location={task.raw?.custom_location_address || ""}
                priority="normal"
              />
            </div>
          ))
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Unscheduled</h3>
        {sortedWaiting.length === 0 ? (
          <div className={styles.empty}>No unscheduled tasks.</div>
        ) : (
          sortedWaiting.map((task) => (
            <div
              key={task.task_id}
              onClick={() => onSelectTask?.(task)}
              style={{ cursor: "pointer" }}
            >
              <TaskCard
                title={task.task_title}
                time={
                  task.task_duedate
                    ? `${new Date(task.task_duedate).toLocaleDateString(
                        "he-IL",
                        { year: "numeric", month: "2-digit", day: "2-digit" }
                      )}${
                        task.task_duetime
                          ? " " + task.task_duetime.slice(0, 5)
                          : ""
                      }`
                    : ""
                }
                location={""}
                priority="normal"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
