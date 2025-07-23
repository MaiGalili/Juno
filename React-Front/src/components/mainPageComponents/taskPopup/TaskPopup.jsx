//TaskPopup.jsx
import React, { useState, useEffect } from "react";
import styles from "./taskPopup.module.css";
import ConfirmModal from "../../ConfirmModal";
import AddressInput from "../sidebar/locations/AddressInput";

export default function TaskPopup({
  mode = "create",
  task = {},
  onSave,
  onClose,
  userCategories = [],
  userLocations = [],
  selectedTask,
  fetchTasks,
}) {
  // --- User settings state ---
  const [userSettings, setUserSettings] = useState({
    defult_buffer: "00:10:00",
    start_day_time: "08:00:00",
    end_day_time: "21:00:00",
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // --- Task fields state ---
  const [title, setTitle] = useState(selectedTask?.task_title || "");
  const [allDay, setAllDay] = useState(selectedTask?.task_all_day || false);
  const [startDate, setStartDate] = useState(
    selectedTask?.task_start_date || ""
  );
  const [endDate, setEndDate] = useState(selectedTask?.task_end_date || "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState(task.note || "");
  const [selectedCategories, setSelectedCategories] = useState(
    task.categories?.map((c) => c.category_id) || []
  );
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [dueTime, setDueTime] = useState(task.due_time || "");
  const [bufferTime, setBufferTime] = useState(task.buffer_time || "00:10:00");
  const [locationId, setLocationId] = useState(selectedTask?.location_id || "");
  const [customAddress, setCustomAddress] = useState("");
  const [customCoords, setCustomCoords] = useState({ lat: null, lng: null });
  const [useFavorite, setUseFavorite] = useState(true);

  // --- UI feedback states ---
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // --- Reset location fields when using favorite address ---
  useEffect(() => {
    if (useFavorite) {
      setCustomAddress("");
      setCustomCoords({ lat: null, lng: null });
    } else {
      setLocationId("");
    }
  }, [useFavorite]);

  // --- Fetch user settings from backend ---
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/users/settings", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUserSettings({
            defult_buffer: data.defult_buffer || "00:10:00",
            start_day_time: data.start_day_time || "08:00:00",
            end_day_time: data.end_day_time || "21:00:00",
          });
        }
        setSettingsLoaded(true);
      } catch (err) {
        setSettingsLoaded(true);
      }
    }
    fetchSettings();
  }, []);

  // --- Initialize fields for NEW task after settings loaded ---
  useEffect(() => {
    // new task and settings loaded
    if (mode === "create" && settingsLoaded && !selectedTask) {
      setBufferTime(userSettings.defult_buffer);
    }
  }, [userSettings, mode, settingsLoaded, selectedTask]);

  // --- Time helpers ---
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

  // --- useEffect: Sync and calculate values ---
  useEffect(() => {
    if (allDay) {
      setStartTime(userSettings.start_day);
      setEndTime(userSettings.end_day);
    }
    if (startDate && !endDate) setEndDate(startDate);
    if (startTime && endTime) {
      const mins = toTime(endTime) - toTime(startTime);
      if (mins >= 0) setDuration(fromMinutes(mins));
    }
    if (startTime && duration && !endTime) {
      const endMins = toTime(startTime) + toTime(duration);
      setEndTime(fromMinutes(endMins));
    }
    if (endTime && duration && !startTime) {
      const startMins = toTime(endTime) - toTime(duration);
      if (startMins >= 0) setStartTime(fromMinutes(startMins));
    }
  }, [
    allDay,
    userSettings.start_day,
    userSettings.end_day,
    startDate,
    endDate,
    startTime,
    endTime,
    duration,
    statusMessage,
  ]);

  // --- Validation and actions ---
  const validate = () => {
    if (!startDate && !dueDate) return "Please select a date or due date.";
    if (!duration && !(startTime && endTime))
      return "Please provide duration or start and end time.";
    if (note.length > 160) return "Note cannot exceed 160 characters.";
    // Location validation
    if (useFavorite) {
      if (!locationId) return "Please select a favorite location.";
    } else {
      if (!customAddress) return "Please enter an address.";
      if (!customCoords.lat || !customCoords.lng)
        return "Please select a valid address from the list.";
    }
    return "";
  };

  // === handleSubmit ===
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
      due_date: dueDate || null,
      due_time: dueTime || null,
      buffer_time: bufferTime,
      location_id: useFavorite ? locationId || null : null,
      custom_location_address: !useFavorite ? customAddress : null,
      custom_location_latitude: !useFavorite ? customCoords.lat : null,
      custom_location_longitude: !useFavorite ? customCoords.lng : null,
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
        {!settingsLoaded ? (
          <div>Loading user settings...</div>
        ) : (
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
                    placeholder="--:--"
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </label>
                <label>
                  End Time:
                  <input
                    type="time"
                    value={endTime}
                    placeholder="--:--"
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
                placeholder="--:--"
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
              Buffer Time:
              <input
                type="time"
                step="1"
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
                {userCategories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  userCategories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              Location:
              <div>
                <button
                  type="button"
                  style={{ background: useFavorite ? "#efefef" : "#fff" }}
                  onClick={() => setUseFavorite(true)}
                >
                  Favorite
                </button>
                <button
                  type="button"
                  style={{ background: !useFavorite ? "#efefef" : "#fff" }}
                  onClick={() => setUseFavorite(false)}
                >
                  Custom
                </button>
              </div>
              {useFavorite ? (
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
              ) : (
                <AddressInput
                  value={customAddress}
                  onChange={(val) => setCustomAddress(val)}
                  onSelectCoords={(coords) => setCustomCoords(coords)}
                  placeholder="Type or select address"
                />
              )}
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
        )}
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
