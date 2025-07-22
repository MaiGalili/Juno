//TaskPopup.jsx
import React, { useState, useEffect } from "react";
import styles from "./taskPopup.module.css";
import ConfirmModal from "../../ConfirmModal";

export default function TaskPopup({
  mode = "create",
  task = {},
  onSave,
  onClose,
  userCategories = [],
  userLocations = [],
  userStartTime = "08:00",
  userEndTime = "21:00",
  selectedTask,
  fetchTasks,
}) {
  // === State for all task fields ===
  const [title, setTitle] = useState(selectedTask?.task_title || "");
  const [allDay, setAllDay] = useState(selectedTask?.task_all_day || false);
  const [startDate, setStartDate] = useState(
    selectedTask?.task_start_date || ""
  );
  const [endDate, setEndDate] = useState(selectedTask?.task_end_date || "");
  const [startTime, setStartTime] = useState(
    selectedTask?.task_start_time || ""
  );
  const [endTime, setEndTime] = useState(selectedTask?.task_end_time || "");
  const [duration, setDuration] = useState(task.duration || "");
  const [note, setNote] = useState(task.note || "");
  const [selectedCategories, setSelectedCategories] = useState(
    task.categories?.map((c) => c.category_id) || []
  );
  const [locationId, setLocationId] = useState(task.location_id || "");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [dueTime, setDueTime] = useState(task.due_time || "");
  const [bufferTime, setBufferTime] = useState(task.buffer_time || 10);

  // === UI feedback states ===
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  // === Confirmation modal state ===
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // === TIME HELPERS convert HH:MM string to minutes ===
  const toTime = (str) => {
    if (!str) return 0;
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };

  // === Helper to convert minutes back to HH:MM ===
  const fromMinutes = (mins) => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // === useEffect: Sync and calculate values ===
  useEffect(() => {
    // Handle all-day toggle
    if (allDay) {
      setStartTime(userStartTime);
      setEndTime(userEndTime);
    }

    // Set endDate if not set
    if (startDate && !endDate) {
      setEndDate(startDate);
    }

    // Calculate duration from start and end time
    if (startTime && endTime) {
      const mins = toTime(endTime) - toTime(startTime);
      if (mins >= 0) setDuration(fromMinutes(mins));
    }

    // Calculate end time from start time and duration
    if (startTime && duration && !endTime) {
      const endMins = toTime(startTime) + toTime(duration);
      setEndTime(fromMinutes(endMins));
    }

    // Calculate start time from end time and duration
    if (endTime && duration && !startTime) {
      const startMins = toTime(endTime) - toTime(duration);
      if (startMins >= 0) setStartTime(fromMinutes(startMins));
    }
  }, [
    allDay,
    userStartTime,
    userEndTime,
    startDate,
    endDate,
    startTime,
    endTime,
    duration,
    statusMessage,
  ]);

  // === VALIDATION ===
  const validate = () => {
    if (!startDate && !dueDate) return "Please select a date or due date.";
    if (!duration && !(startTime && endTime))
      return "Please provide duration or start and end time.";
    if (note.length > 160) return "Note cannot exceed 160 characters.";
    return "";
  };

  // === HANDLE FORM SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    await handleSave();
  };

  // === CLEAR FORM ===
  const clearFields = () => {
    setTitle("");
    setAllDay(false);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setDuration("");
    setNote("");
    setSelectedCategories([]);
    setLocationId("");
    setDueDate("");
    setDueTime("");
    setBufferTime(10);
    setError("");
  };

  // === ACTIONS ===
  //Show confirmation modal for delete
  const handleDelete = () => {
    if (!task.task_id) return;
    setConfirmMessage("Are you sure you want to delete this task?");
    setConfirmAction(() => handleDeleteConfirmed);
  };

  //Show confirmation modal for update
  const handleUpdate = () => {
    if (!task.task_id) return;
    setConfirmMessage("Are you sure you want to save changes?");
    setConfirmAction(() => handleUpdateConfirmed);
  };

  //Execute delete operation
  const handleDeleteConfirmed = async () => {
    setConfirmAction(null);
    try {
      const res = await fetch(
        `http://localhost:8801/api/tasks/delete/${task.task_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const result = await res.json();

      if (result.success) {
        await fetchTasks();
        onSave?.(result);
        onClose?.();
      } else {
        setStatusMessage(result.message || "Failed to delete task");
        setStatusType("error");
      }
    } catch (err) {
      setStatusMessage("Error while deleting task");
      setStatusType("error");
    }
  };

  //Execute update operation
  const handleUpdateConfirmed = async () => {
    setConfirmAction(null);
    try {
      const res = await fetch(
        `http://localhost:8801/api/tasks/update/assigned/${task.task_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title,
            all_day: allDay,
            start_date: startDate,
            end_date: endDate,
            start_time: startTime,
            end_time: endTime,
            duration,
            note,
            category_ids: selectedCategories,
            location_id: locationId || null,
            due_date: dueDate || null,
            due_time: dueTime || null,
            buffer_time: bufferTime,
          }),
        }
      );
      const result = await res.json();

      if (result.success) {
        await fetchTasks();
        onSave?.(result);
        onClose?.();
      } else {
        setStatusMessage(result.message || "Failed to update task");
        setStatusType("error");
      }
    } catch (err) {
      setStatusMessage("Error while updating task");
      setStatusType("error");
    }
  };

  //Save new task or update existing task
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

    const isWaitingTask = dueDate && !startDate && !startTime && !endTime;
    const endpoint =
      mode === "edit"
        ? `http://localhost:8801/api/tasks/${task.task_id}`
        : isWaitingTask
        ? "http://localhost:8801/api/tasks/create/waiting"
        : "http://localhost:8801/api/tasks/create/assigned";

    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log(result);

      if (result.success) {
        onSave?.(result);
        if (mode === "create") clearFields();
        setStatusMessage("Task saved successfully.");
        setStatusType("success");
      } else {
        setStatusMessage(result.message || "Failed to save task");
        setStatusType("error");
      }
    } catch (err) {
      setStatusMessage("Error while saving task");
      setStatusType("error");
    }
  };

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.popup}>
        <h2>{selectedTask?.task_id ? "Edit Task" : "Create Task"}</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <label>
            Title:
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            All Day:
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
          </label>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
                />
              </label>
              <label>
                End Time:
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
            />
          </label>
          <label>
            Due Date:
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <label>
            Due Time:
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </label>
          <label>
            Buffer Time (min):
            <input
              type="number"
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
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
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.buttons}>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            {mode !== "view" && <button type="submit">Save</button>}
            {selectedTask?.task_id && (
              <>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={styles.updateButton}
                  onClick={handleUpdate}
                >
                  Update
                </button>
              </>
            )}
          </div>
        </form>

        {statusMessage && (
          <div
            className={`${styles.statusBox} ${
              statusType === "success" ? styles.success : styles.error
            }`}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={confirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
