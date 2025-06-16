// TaskPopup.jsx - Create/Edit/View Task Modal Component
import React, { useState, useEffect } from "react";
import styles from "./taskPopup.module.css";

export default function TaskPopup({
  mode = "create",
  task = {},
  onSave,
  onClose,
  userCategories = [],
  userLocations = [],
  userStartTime = "08:00",
  userEndTime = "21:00",
}) {
  const [title, setTitle] = useState(task.title || "");
  const [allDay, setAllDay] = useState(task.all_day || false);
  const [startDate, setStartDate] = useState(task.start_date || "");
  const [endDate, setEndDate] = useState(task.end_date || "");
  const [startTime, setStartTime] = useState(task.start_time || "");
  const [endTime, setEndTime] = useState(task.end_time || "");
  const [duration, setDuration] = useState(task.duration || "");
  const [note, setNote] = useState(task.note || "");
  const [selectedCategories, setSelectedCategories] = useState(
    task.categories || []
  );
  const [locationId, setLocationId] = useState(task.location_id || "");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [dueTime, setDueTime] = useState(task.due_time || "");
  const [bufferTime, setBufferTime] = useState(task.buffer_time || 10);
  const [error, setError] = useState("");

  const toTime = (str) => {
    if (!str) return 0;
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };

  const fromMinutes = (mins) => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  useEffect(() => {
    if (allDay) {
      setStartTime(userStartTime);
      setEndTime(userEndTime);
    }
  }, [allDay, userStartTime, userEndTime]);

  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (startTime && endTime) {
      const mins = toTime(endTime) - toTime(startTime);
      if (mins >= 0) setDuration(fromMinutes(mins));
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (startTime && duration && !endTime) {
      const endMins = toTime(startTime) + toTime(duration);
      setEndTime(fromMinutes(endMins));
    }
  }, [startTime, duration]);

  useEffect(() => {
    if (endTime && duration && !startTime) {
      const startMins = toTime(endTime) - toTime(duration);
      if (startMins >= 0) setStartTime(fromMinutes(startMins));
    }
  }, [endTime, duration]);

  const disableTimeFields = dueDate !== "";
  const disableDueFields = startTime && endTime && duration;

  const validate = () => {
    if (!startDate && !dueDate) return "Please select a date or due date.";
    if (!duration && !(startTime && endTime))
      return "Please provide duration or start and end time.";
    if (note.length > 160) return "Note cannot exceed 160 characters.";
    return "";
  };

  const handleSave = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const payload = {
      title: title || "Title",
      all_day: allDay,
      start_date: startDate,
      end_date: endDate || startDate,
      start_time: startTime,
      end_time: endTime,
      duration,
      note,
      category_ids: selectedCategories,
      location_id: locationId || null,
      due_date: dueDate || null,
      due_time: dueTime || null,
      buffer_time: bufferTime,
    };

    try {
      const res = await fetch("http://localhost:8801/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        onSave?.(result);
      } else {
        setError(result.message || "Failed to create task");
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Server error while creating task");
    }
  };

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.popup}>
        <h2>
          {mode === "edit"
            ? "Edit Task"
            : mode === "view"
            ? "Task Details"
            : "Create Task"}
        </h2>

        <label>
          Title:
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mode === "view"}
          />
        </label>

        <label>
          All Day:
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            disabled={mode === "view"}
          />
        </label>

        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={mode === "view"}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={mode === "view"}
          />
        </label>

        {!allDay && (
          <>
            <label>
              Start Time:
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={mode === "view" || disableTimeFields}
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={mode === "view" || disableTimeFields}
              />
            </label>
          </>
        )}

        <label>
          Duration:
          <input
            type="time"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={mode === "view" || disableTimeFields}
          />
        </label>

        <label>
          Due Date:
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={mode === "view" || disableDueFields}
            style={{ color: disableDueFields ? "#999" : undefined }}
          />
        </label>

        <label>
          Due Time:
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            disabled={mode === "view" || disableDueFields}
            style={{ color: disableDueFields ? "#999" : undefined }}
          />
        </label>

        <label>
          Buffer Time (min):
          <input
            type="number"
            value={bufferTime}
            onChange={(e) => setBufferTime(e.target.value)}
            disabled={mode === "view"}
          />
        </label>

        <label>
          Categories:
          <select
            multiple
            value={selectedCategories}
            onChange={(e) =>
              setSelectedCategories(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
            disabled={mode === "view"}
          >
            {userCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Location:
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            disabled={mode === "view"}
          >
            <option value="">Select</option>
            {userLocations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.icon} {loc.location_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Note:
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={160}
            disabled={mode === "view"}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.buttons}>
          <button onClick={onClose}>Cancel</button>
          {mode !== "view" && <button onClick={handleSave}>Save</button>}
        </div>
      </div>
    </div>
  );
}
