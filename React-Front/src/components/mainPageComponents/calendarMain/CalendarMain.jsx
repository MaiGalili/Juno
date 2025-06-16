// React-Front/src/pages/mainPage/CalendarMain.jsx
import React, { useState } from "react";
import TaskPopup from "../taskPopup/TaskPopup";
// import styles from "./calendarMain.module.css";

export default function CalendarMain({ userEmail, isLoggin, setIsLoggin }) {
  const [showPopup, setShowPopup] = useState(false);
  const [viewMode, setViewMode] = useState("day"); // "day", "week", "month"

  const handleModeChange = (mode) => setViewMode(mode);

  return (
    <div className="calendar-container">
      {/* צד שמאל: ניווט ותפריטים */}
      <aside className="sidebar">
        <h2>JUNO</h2>
        <button onClick={() => setShowPopup(true)}>+ NEW TASK</button>
        <button>Reports</button>
        <div>
          <h3>LABELS</h3>
          {/* כאן נטען תוויות */}
        </div>
        <div>
          <h3>LOCATIONS</h3>
          {/* כאן נטען מיקומים */}
        </div>
      </aside>

      {/* מרכז המסך: לוח השנה */}
      <main className="calendar-main">
        <div className="calendar-header">
          <input type="text" placeholder="SEARCH TASK" className="search-bar" />
          <div className="view-mode-buttons">
            <button onClick={() => handleModeChange("day")}>📅</button>
            <button onClick={() => handleModeChange("week")}>🗓️</button>
            <button onClick={() => handleModeChange("month")}>📆</button>
          </div>
        </div>

        <div className="calendar-view">
          {viewMode === "day" && <div>Day View (to be implemented)</div>}
          {viewMode === "week" && <div>Week View (to be implemented)</div>}
          {viewMode === "month" && <div>Month View (to be implemented)</div>}
        </div>
      </main>

      {/* צד ימין: רשימת משימות */}
      <aside className="task-sidebar">
        <h3>TASKS</h3>
        {/* כאן תופיע רשימת משימות */}
      </aside>

      {showPopup && (
        <TaskPopup
          mode="create"
          onClose={() => setShowPopup(false)}
          userEmail={userEmail}
          userCategories={[]} // יתווסף בעתיד מ־backend
          userLocations={[]} // יתווסף בעתיד מ־backend
        />
      )}
    </div>
  );
}
