import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./taskPopup.module.css";
import SuggestionPanel from "./suggestionPanel/SuggestionPanel";

export default function TaskPopup({ mode, onClose, onSave, userEmail }) {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [dueDateValue, setDueDateValue] = useState(null);
  const [dueTimeValue, setDueTimeValue] = useState(null);

  // ✅ Fetch categories
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

  // ✅ Fetch locations
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

  // ✅ Submit logic adapted to backend
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
      buffer_time: parseInt(data.bufferTime || 0),
      location_id: data.locationId || null,
      categories: Array.from(data.categories || []),
      task_note: data.note || "",
      email: userEmail,
    };

    console.log("Final Payload to Save:", payload);
    onSave(payload);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{mode === "create" ? "Create Task" : "Edit Task"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* ✅ Title */}
          <div className={styles.formGroup}>
            <label>Title</label>
            <input type="text" {...register("title", { required: true })} />
          </div>

          {/* ✅ Dates */}
          <div className={styles.dateTimeRow}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="date" {...register("startDate")} />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input type="date" {...register("endDate")} />
            </div>
          </div>

          {/* ✅ Times */}
          <div className={styles.timeRow}>
            <div className={styles.formGroup}>
              <label>Start Time</label>
              <input type="time" {...register("startTime")} />
            </div>
            <div className={styles.formGroup}>
              <label>End Time</label>
              <input type="time" {...register("endTime")} />
            </div>
          </div>

          {/* ✅ Duration */}
          <div className={styles.formGroup}>
            <label>Duration (hh:mm)</label>
            <input type="time" {...register("duration")} />
          </div>

          {/* ✅ Due Date & Time */}
          <div className={styles.formGroup}>
            <label>Due Date</label>
            <input
              type="date"
              {...register("dueDate")}
              onChange={(e) => setDueDateValue(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Due Time</label>
            <input
              type="time"
              {...register("dueTime")}
              onChange={(e) => setDueTimeValue(e.target.value)}
            />
          </div>

          {/* ✅ Buffer Time */}
          <div className={styles.formGroup}>
            <label>Buffer Time (minutes)</label>
            <input type="number" {...register("bufferTime")} placeholder="10" />
          </div>

          {/* ✅ Locations */}
          <div className={styles.formGroup}>
            <label>Location</label>
            {loadingLocations ? (
              <p>Loading...</p>
            ) : (
              <select {...register("locationId")}>
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ✅ Categories */}
          <div className={styles.formGroup}>
            <label>Categories</label>
            {loadingCategories ? (
              <p>Loading...</p>
            ) : (
              <select {...register("categories")} multiple>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ✅ Note */}
          <div className={styles.formGroup}>
            <label>Note</label>
            <textarea
              {...register("note")}
              placeholder="Additional details..."
            />
          </div>

          {/* ✅ Suggestion Panel */}
          {dueDateValue && watch("duration") && (
            <SuggestionPanel
              dueDate={dueDateValue}
              dueTime={dueTimeValue}
              duration={watch("duration")}
              bufferTime={watch("bufferTime")}
              locationId={watch("locationId")}
              userEmail={userEmail}
              onSelectSlot={(start, end) => {
                setValue("startDate", start.split("T")[0]);
                setValue("endDate", start.split("T")[0]);
                setValue("startTime", start.split("T")[1].slice(0, 5));
                setValue("endTime", end.split("T")[1].slice(0, 5));
              }}
            />
          )}

          {/* ✅ Buttons */}
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
