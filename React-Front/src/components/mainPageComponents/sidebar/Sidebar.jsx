import styles from "./sidebar.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState } from "react";

import Categories from "./categories/Categories";
import Locations from "./locations/Locations";
import TaskPopup from "../taskPopup/TaskPopup";

export default function Sidebar({ selectedDate, setSelectedDate }) {
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  return (
    <aside className={styles.sidebar}>
      {/* בוחר תאריך */}
      <div className={styles.datePickerWrapper}>
        <DatePicker selected={selectedDate} onChange={setSelectedDate} inline />
      </div>

      {/* כפתורים */}
      <div className={styles.buttons}>
        <button className={styles.report}>Reports</button>
        <button
          className={styles.newTask}
          onClick={() => setShowTaskPopup(true)}
        >
          + New Task
        </button>
      </div>
      {showTaskPopup && (
        <TaskPopup
          mode="create"
          onClose={() => setShowTaskPopup(false)}
          onSave={(taskData) => {
            console.log("Task created:", taskData);
            setShowTaskPopup(false);
          }}
        />
      )}

      {/* לייבלים */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>Categories</span>
        </div>
        <Categories />
      </div>

      {/* מיקומים */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>LOCATIONS</span>
        </div>
        <Locations />
      </div>
    </aside>
  );
}
