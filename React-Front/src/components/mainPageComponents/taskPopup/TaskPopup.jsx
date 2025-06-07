import React, { useState } from "react";
import styles from "./taskPopup.module.css";

export default function TaskPopup({
  mode = "create",
  task = {},
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(task.title || "");
  const [date, setDate] = useState(task.date || "");
  const [startTime, setStartTime] = useState(task.startTime || "");
  const [endTime, setEndTime] = useState(task.endTime || "");
  const [category, setCategory] = useState(task.category || "");
  const [description, setDescription] = useState(task.description || "");
  const [isFavorite, setIsFavorite] = useState(task.isFavorite || false);
  const [location, setLocation] = useState(task.location || "");

  const isViewMode = mode === "view";

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      title,
      date,
      startTime,
      endTime,
      category,
      description,
      isFavorite,
      location,
    };
    onSave(taskData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2>
          {mode === "edit"
            ? "Edit Task"
            : mode === "view"
            ? "Task Details"
            : "New Task"}
        </h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isViewMode}
              required
            />
          </label>

          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isViewMode}
            />
          </label>

          <label>
            Start Time:
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isViewMode}
            />
          </label>

          <label>
            End Time:
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isViewMode}
            />
          </label>

          <label>
            Category:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isViewMode}
            >
              <option value="">Select...</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
            </select>
          </label>

          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isViewMode}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              disabled={isViewMode}
            />
            Favorite
          </label>

          <label>
            Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isViewMode}
            />
          </label>

          <div className={styles.buttons}>
            <button type="button" onClick={onClose}>
              Close
            </button>
            {!isViewMode && (
              <button type="submit">
                {mode === "edit" ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
