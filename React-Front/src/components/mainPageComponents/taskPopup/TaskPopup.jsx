//TaskPopup.jsx
import React, { useState, useEffect } from "react";
import styles from "./taskPopup.module.css";
import ConfirmModal from "../../ConfirmModal";
import AddressInput from "../sidebar/locations/AddressInput";
import RepeatActionPopup from "./RepeatActionPopup/RepeatActionPopup";

export default function TaskPopup({
  mode = "create",
  task = null,
  onSave,
  onClose,
  userCategories = [],
  userLocations = [],
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
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [bufferTime, setBufferTime] = useState("00:10");
  const [locationId, setLocationId] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customCoords, setCustomCoords] = useState({ lat: null, lng: null });
  const [useFavorite, setUseFavorite] = useState(true);
  const [taskRepeat, setTaskRepeat] = useState("none");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  // --- UI feedback states ---
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showRepeatPopup, setShowRepeatPopup] = useState(false);
  const [repeatPopupAction, setRepeatPopupAction] = useState(""); // "delete" or "edit"

  const isRepeatingTask = !!(
    task?.series_id &&
    task?.task_repeat &&
    task.task_repeat !== "none"
  );

  //delete after fix
  useEffect(() => {
    if (task) {
      console.log("task", task);
      console.log("dueDate:", dueDate, "dueTime:", dueTime);
    }
  }, [task, dueDate, dueTime]);

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
            defult_buffer: hhmmFromHHMMSS(data.defult_buffer) || "00:10",
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

  // --- Set task fields based on mode and task data ---
  useEffect(() => {
    if (mode === "create") {
      // Reset task fields
      setTitle("");
      setAllDay(false);
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setDuration("");
      setNote("");
      setSelectedCategories([]);
      setDueDate("");
      setDueTime("");
      setBufferTime(userSettings.defult_buffer || "00:10");
      setLocationId(userSettings.default_location_id || "");
      setCustomAddress("");
      setCustomCoords({ lat: null, lng: null });
      setUseFavorite(true);
      setTaskRepeat("none");
      setRepeatUntil("");
    } else if (mode === "edit" || mode === "view") {
      setTitle(task?.task_title || "");
      setNote(task?.task_note || "");
      setDuration(task?.task_duration || "");
      setTaskRepeat(task?.task_repeat || "none");
      setRepeatUntil(task?.repeat_until || "");

      // קטגוריות: תומך בכל המבנים
      if (Array.isArray(task?.categories)) {
        setSelectedCategories(
          task.categories.map((c) => String(c.category_id))
        );
      } else if (Array.isArray(task?.category_ids)) {
        setSelectedCategories(task.category_ids.map(String));
      } else if (task?.category_id) {
        setSelectedCategories([String(task.category_id)]);
      } else {
        setSelectedCategories([]);
      }

      // Buffer time: תומך בכל פורמט
      const bufferRaw = task?.buffer_time || task?.task_buffertime || "";
      setBufferTime(hhmmFromHHMMSS(bufferRaw) || "00:10");

      if (
        task?.task_duedate !== undefined &&
        task?.task_duedate !== null &&
        task?.task_duedate !== ""
      ) {
        // משימת המתנה
        setDueDate(task.task_duedate || "");
        setDueTime((task.task_duetime || "").slice(0, 5));
        setStartDate("");
        setEndDate("");
        setStartTime("");
        setEndTime("");
        setAllDay(false);
      } else {
        // משימה רגילה
        setDueDate("");
        setDueTime("");
        setStartDate(task?.task_start_date || "");
        setEndDate(task?.task_end_date || "");
        setStartTime(task?.task_start_time || "");
        setEndTime(task?.task_end_time || "");
        setAllDay(task?.task_all_day || false);
      }
      // לוקיישנים
      if (task?.location_id && !task?.custom_location_address) {
        setUseFavorite(true);
        setLocationId(String(task.location_id));
        setCustomAddress("");
        setCustomCoords({ lat: null, lng: null });
      } else if (task?.custom_location_address) {
        setUseFavorite(false);
        setCustomAddress(task.custom_location_address);
        setCustomCoords({
          lat: task?.custom_location_latitude || null,
          lng: task?.custom_location_longitude || null,
        });
        setLocationId("");
      } else {
        setUseFavorite(true);
        setLocationId("");
        setCustomAddress("");
        setCustomCoords({ lat: null, lng: null });
      }
    }
  }, [task, mode, userSettings]);

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
  function hhmmFromHHMMSS(str) {
    if (!str) return "";
    if (/^\d{1,2}:\d{2}$/.test(str)) return str.padStart(5, "0"); // "0:30" -> "00:30"
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.slice(0, 5);
    return "";
  }

  function toInputDateString(date) {
    if (!date) return "";
    // If already in correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse if it's an ISO string
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      // pad month and day
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${d.getFullYear()}-${month}-${day}`;
    }
    return "";
  }

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
    setBufferTime("00:10");
    setError("");
  };

  // === ACTIONS ===
  //Show confirmation modal for delete
  const handleDelete = () => {
    console.log("task in popup", task);
    console.log("isRepeatingTask?", isRepeatingTask);

    if (!task?.task_id) return;
    if (isRepeatingTask) {
      setRepeatPopupAction("delete");
      setShowRepeatPopup(true);
    } else {
      setConfirmMessage("Are you sure you want to delete this task?");
      setConfirmAction(() => handleDeleteConfirmed);
    }
  };

  //Show confirmation modal for update
  const handleUpdate = () => {
    if (!task?.task_id) return;
    if (isRepeatingTask) {
      setRepeatPopupAction("edit");
      setShowRepeatPopup(true);
    } else {
      setConfirmMessage("Are you sure you want to save changes?");
      setConfirmAction(() => handleUpdateConfirmed);
    }
  };

  const handleRepeatPopupSelect = (scope) => {
    setShowRepeatPopup(false);
    if (repeatPopupAction === "delete") {
      handleDeleteConfirmed(scope); // Pass the scope to your delete logic
    } else if (repeatPopupAction === "edit") {
      handleUpdateConfirmed(scope); // Pass the scope to your update logic
    }
  };

  //Execute delete operation
  const handleDeleteConfirmed = async (scope = "ONE") => {
    setConfirmAction(null);
    try {
      const res = await fetch(
        `http://localhost:8801/api/tasks/delete/${task.task_id}?scope=${scope}`,
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
  const handleUpdateConfirmed = async (scope = "ONE") => {
    setConfirmAction(null);
    try {
      // is this a waiting task?
      const isWaitingTask = task?.task_duedate !== undefined;

      const endpoint = isWaitingTask
        ? `http://localhost:8801/api/tasks/update/waiting/${task.task_id}`
        : `http://localhost:8801/api/tasks/update/assigned/${task.task_id}?scope=${scope}`;

      const payload = isWaitingTask
        ? {
            title,
            duration,
            note,
            category_ids: selectedCategories,
            location_id: useFavorite ? locationId || null : null,
            custom_location_address: !useFavorite ? customAddress : null,
            custom_location_latitude: !useFavorite ? customCoords.lat : null,
            custom_location_longitude: !useFavorite ? customCoords.lng : null,
            due_date: dueDate || null,
            due_time: dueTime || null,
            buffer_time: bufferTime,
          }
        : {
            title,
            all_day: allDay,
            start_date: startDate,
            end_date: endDate,
            start_time: startTime,
            end_time: endTime,
            duration,
            note,
            category_ids: selectedCategories,
            location_id: useFavorite ? locationId || null : null,
            custom_location_address: !useFavorite ? customAddress : null,
            custom_location_latitude: !useFavorite ? customCoords.lat : null,
            custom_location_longitude: !useFavorite ? customCoords.lng : null,
            buffer_time: bufferTime,
          };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
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
      task_repeat: taskRepeat,
      repeat_until: repeatUntil || null,
      note,
      category_ids: selectedCategories,
      due_date: dueDate || null,
      due_time: dueTime || null,
      buffer_time: bufferTime.length === 5 ? bufferTime + ":00" : bufferTime,
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
        setStatusMessage(
          result.waitingListFull
            ? "Waiting list is now full."
            : "Task saved successfully."
        );

        setStatusType("success");
        if (result.waitingListFull) {
          setTimeout(() => {
            onClose?.();
          }, 2000);
        } else {
          onClose?.();
        }
      } else {
        if (result.errorType === "WAITING_LIST_FULL") {
          setStatusMessage(
            "Waiting list is full. Cannot add new waiting task."
          );
          setStatusType("error");
        } else {
          setStatusMessage(result.message || "Failed to save task");
          setStatusType("error");
        }
      }
    } catch (err) {
      setStatusMessage("Error while saving task");
      setStatusType("error");
    }
  };

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.popup}>
        <h2>{task?.task_id ? "Edit Task" : "Create Task"}</h2>
        {!settingsLoaded ? (
          <div>Loading user settings...</div>
        ) : (
          <div className={styles.popupBody}>
            <form onSubmit={handleSubmit} autoComplete="off">
              <label>
                Title:
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
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
                  value={toInputDateString(startDate)}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={toInputDateString(endDate)}
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
                Repeat:
                <select
                  id="taskRepeat"
                  value={taskRepeat}
                  onChange={(e) => setTaskRepeat(e.target.value)}
                  className={styles.input}
                >
                  <option value="none">Do not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>

              {taskRepeat !== "none" && (
                <label>
                  Repeat Until:
                  <input
                    type="date"
                    value={toInputDateString(repeatUntil)}
                    onChange={(e) => setRepeatUntil(e.target.value)}
                  />
                </label>
              )}

              <label>
                Due Date:
                <input
                  type="date"
                  value={toInputDateString(dueDate)}
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
                  <>
                    <select
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                    >
                      <option value="">Select</option>
                      {userLocations.map((loc) => (
                        <option
                          key={loc.location_id}
                          value={String(loc.location_id)}
                        >
                          {loc.icon} {loc.location_name}
                        </option>
                      ))}
                    </select>
                  </>
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
                {task?.task_id && (
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
          </div>
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
      <RepeatActionPopup
        open={showRepeatPopup}
        onClose={() => setShowRepeatPopup(false)}
        onSelect={handleRepeatPopupSelect}
        actionType={repeatPopupAction}
        taskTitle={title}
      />
    </div>
  );
}
