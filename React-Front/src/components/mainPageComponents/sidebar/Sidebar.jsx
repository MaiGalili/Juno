// Sidebar.jsx
import styles from "./sidebar.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";

import Categories from "./categories/Categories";
import Locations from "./locations/Locations";

export default function Sidebar({
  selectedDate,
  setSelectedDate,
  userEmail,
  setShowPopup,
  userCategories,
  fetchCategories,
  userLocations,
  fetchLocations,
}) {
  return (
    <aside className={styles.sidebar}>
      {/* Date picker for selecting a day */}
      <div className={styles.datePickerWrapper}>
        <DatePicker selected={selectedDate} onChange={setSelectedDate} inline />
      </div>
      {/* Buttons for generating reports and creating a new task */}
      <div className={styles.buttons}>
        <button className={styles.report}>Reports</button>
        <button className={styles.newTask} onClick={() => setShowPopup(true)}>
          + New Task
        </button>
      </div>
      {/* Categories section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>Categories</span>
        </div>
        <Categories
          userCategories={userCategories}
          fetchCategories={fetchCategories}
          userEmail={userEmail}
        />
      </div>
      Locations section
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>LOCATIONS</span>
        </div>
        <Locations
          userLocations={userLocations}
          fetchLocations={fetchLocations}
        />
      </div>
    </aside>
  );
}
