// TaskSuggestionsPanel.jsx

import React from "react";
import styles from "./taskSuggestionsPanel.module.css";

export default function TaskSuggestionsPanel({
  startDate,
  endDate,
  duration,
  userSettings,
  tasks,
  locationId,
  customAddress,
  bufferTime,
  onSelectSuggestion,
}) {
  return (
    <div className={styles.panel}>
      <h4>Suggestions</h4>
      <div className={styles.empty}>
        No suggestions yet. Please fill required fields.
      </div>
    </div>
  );
}
