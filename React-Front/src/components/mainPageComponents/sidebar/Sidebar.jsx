import React from "react";
import styles from "./sidebar.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Categories from "./categories/Categories";
import Locations from "./locations/Locations";

export default function Sidebar({ selectedDate, setSelectedDate }) {
  return (
    <aside className={styles.sidebar}>
      {/* בוחר תאריך */}
      <div className={styles.datePickerWrapper}>
        <DatePicker selected={selectedDate} onChange={setSelectedDate} inline />
      </div>

      {/* כפתורים */}
      <div className={styles.buttons}>
        <button className={styles.report}>Reports</button>
        <button className={styles.newTask}>+ New Task</button>
      </div>

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
