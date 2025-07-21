// TaskPopup.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./taskPopup.module.css";
import SuggestionPanel from "./suggestionPanel/SuggestionPanel";
import TaskLocationPicker from "./taskLocationPicker/TaskLocationPicker";
export default function TaskPopup({
  mode,
  onClose,
  onSave,
  userEmail,
  currentTask,
}) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [dueDateValue, setDueDateValue] = useState(null);
  const [dueTimeValue, setDueTimeValue] = useState(null);

  // Holds the selected location (saved or custom)
  const [taskLocation, setTaskLocation] = useState(
    currentTask
      ? currentTask.location_id
        ? {
            type: "saved",
            location_id: currentTask.location_id,
            location_name: currentTask.location_name,
            location_address: currentTask.location_address,
            latitude: currentTask.latitude,
            longitude: currentTask.longitude,
          }
        : {
            type: "custom",
            address: currentTask.custom_location_address,
            latitude: currentTask.custom_location_latitude,
            longitude: currentTask.custom_location_longitude,
          }
      : null
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8801/api/categories/getAll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userEmail }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    if (userEmail) fetchCategories();
  }, [userEmail]);

  // Fetch saved locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:8801/api/locations/getAll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userEmail }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.locations)) {
          setLocations(data.locations);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    };
    if (userEmail) fetchLocations();
  }, [userEmail]);

  // Handle the form submission
  const onSubmit = (data) => {
    const payload = {
      task_title: data.title,
      task_start_date: data.startDate || null,
      task_end_date: data.endDate || null,
      task_start_time: data.startTime || null,
      task_end_time: data.endTime || null,
      task_duration: data.duration ? `${data.duration}:00` : null,
      task_due_date: data.dueDate || null,
      task_due_time: data.dueTime || null,
      buffer_time: parseInt(data.bufferTime || 0, 10),
      category_ids: Array.isArray(data.categories)
        ? data.categories
        : data.categories
        ? [data.categories]
        : [],
      task_note: data.note || "",
      email: userEmail,
    };

    // Attach the selected location info to the payload
    if (taskLocation?.type === "saved") {
      payload.location_id = taskLocation.location_id;
      payload.custom_location_address = null;
      payload.custom_location_latitude = null;
      payload.custom_location_longitude = null;
    } else if (taskLocation?.type === "custom") {
      payload.location_id = null;
      payload.custom_location_address = taskLocation.address;
      payload.custom_location_latitude = taskLocation.latitude;
      payload.custom_location_longitude = taskLocation.longitude;
    } else {
      payload.location_id = null;
      payload.custom_location_address = null;
      payload.custom_location_latitude = null;
      payload.custom_location_longitude = null;
    }

    // Send to parent/save function
    onSave(payload);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{mode === "create" ? "Create Task" : "Edit Task"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              {...register("title", { required: true })}
              defaultValue={currentTask?.task_title || ""}
            />
          </div>

          {/* Dates */}
          <div className={styles.dateTimeRow}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                {...register("startDate")}
                defaultValue={currentTask?.task_start_date || ""}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                {...register("endDate")}
                defaultValue={currentTask?.task_end_date || ""}
              />
            </div>
          </div>

          {/* Times */}
          <div className={styles.timeRow}>
            <div className={styles.formGroup}>
              <label>Start Time</label>
              <input
                type="time"
                {...register("startTime")}
                defaultValue={currentTask?.task_start_time || ""}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Time</label>
              <input
                type="time"
                {...register("endTime")}
                defaultValue={currentTask?.task_end_time || ""}
              />
            </div>
          </div>

          {/* Duration */}
          <div className={styles.formGroup}>
            <label>Duration (hh:mm)</label>
            <input
              type="time"
              {...register("duration")}
              defaultValue={currentTask?.task_duration?.slice(0, 5) || ""}
            />
          </div>

          {/* Due Date & Time */}
          <div className={styles.formGroup}>
            <label>Due Date</label>
            <input
              type="date"
              {...register("dueDate")}
              defaultValue={currentTask?.task_due_date || ""}
              onChange={(e) => setDueDateValue(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Due Time</label>
            <input
              type="time"
              {...register("dueTime")}
              defaultValue={currentTask?.task_due_time || ""}
              onChange={(e) => setDueTimeValue(e.target.value)}
            />
          </div>

          {/* Buffer Time */}
          <div className={styles.formGroup}>
            <label>Buffer Time (minutes)</label>
            <input
              type="number"
              {...register("bufferTime")}
              placeholder="10"
              defaultValue={currentTask?.buffer_time || ""}
            />
          </div>

          {/* Location Picker */}
          <div className={styles.formGroup}>
            <label>Location</label>
            <TaskLocationPicker
              locations={locations}
              initialLocationId={currentTask?.location_id || null}
              initialCustomAddress={currentTask?.custom_location_address || ""}
              initialCustomLat={currentTask?.custom_location_latitude || null}
              initialCustomLng={currentTask?.custom_location_longitude || null}
              onChange={setTaskLocation}
            />
          </div>

          {/* Categories */}
          <div className={styles.formGroup}>
            <label>Categories</label>
            {loadingCategories ? (
              <p>Loading...</p>
            ) : (
              <select
                {...register("categories")}
                multiple
                defaultValue={
                  currentTask?.categories
                    ? currentTask.categories.map(String) // ensure it's a string
                    : []
                }
              >
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <div style={{ fontSize: "0.85em", color: "#555", marginTop: 4 }}>
              Hold Ctrl (or Cmd on Mac) to select or unselect multiple
              categories.
            </div>
          </div>

          {/* Note */}
          <div className={styles.formGroup}>
            <label>Note</label>
            <textarea
              {...register("note")}
              defaultValue={currentTask?.task_note || ""}
              placeholder="Additional details..."
            />
          </div>

          {/* Suggestion Panel (if needed) */}
          {dueDateValue && watch("duration") && (
            <SuggestionPanel
              dueDate={dueDateValue}
              dueTime={dueTimeValue}
              duration={watch("duration")}
              bufferTime={watch("bufferTime")}
              locationId={taskLocation?.location_id}
              userEmail={userEmail}
              onSelectSlot={(start, end) => {
                setValue("startDate", start.split("T")[0]);
                setValue("endDate", start.split("T")[0]);
                setValue("startTime", start.split("T")[1].slice(0, 5));
                setValue("endTime", end.split("T")[1].slice(0, 5));
              }}
            />
          )}

          {/* Buttons */}
          <div className={styles.buttons}>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
