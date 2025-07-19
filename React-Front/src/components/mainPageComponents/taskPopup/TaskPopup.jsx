import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import SuggestionPanel from "./suggestionPanel/SuggestionPanel";

export default function TaskPopup({
  mode = "create", // "create" or "edit"
  selectedTask = {}, // Task data for edit
  userCategories = [],
  userLocations = [],
  userEmail,
  onSave,
  onClose,
  fetchTasks,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: selectedTask.task_title || "",
      allDay: selectedTask.task_all_day || false,
      startDate: selectedTask.task_start_date || "",
      endDate: selectedTask.task_end_date || "",
      startTime: selectedTask.task_start_time || "",
      endTime: selectedTask.task_end_time || "",
      duration: selectedTask.task_duration || "",
      dueDate: selectedTask.task_due_date || "",
      dueTime: selectedTask.task_due_time || "",
      note: selectedTask.task_note || "",
      bufferTime: selectedTask.task_buffertime || 10,
      categories: selectedTask.categories?.map((c) => c.category_id) || [],
      locationId: selectedTask.location_id || "",
    },
  });

  // Watch fields to control UI logic
  const allDay = watch("allDay");
  const dueDate = watch("dueDate");
  const duration = watch("duration");

  // If allDay = true, fill default times
  useEffect(() => {
    if (allDay) {
      setValue("startTime", "08:00");
      setValue("endTime", "21:00");
    }
  }, [allDay, setValue]);

  /**Submit handler*/
  const onSubmit = async (data) => {
    const isWaitingTask = data.dueDate && !data.startDate && !data.startTime;

    const endpoint =
      mode === "edit"
        ? `http://localhost:8801/api/tasks/${selectedTask.task_id}`
        : isWaitingTask
        ? "http://localhost:8801/api/tasks/create/waiting"
        : "http://localhost:8801/api/tasks/create/assigned";

    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: data.title || "Untitled Task",
          all_day: data.allDay,
          start_date: data.startDate,
          end_date: data.endDate || data.startDate,
          start_time: data.startTime,
          end_time: data.endTime,
          duration: data.duration,
          note: data.note,
          category_ids: data.categories,
          location_id: data.locationId || null,
          due_date: data.dueDate || null,
          due_time: data.dueTime || null,
          buffer_time: data.bufferTime,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await fetchTasks();
        onSave?.(result);
        if (mode === "create") reset();
        onClose?.();
      } else {
        alert(result.message || "Failed to save task");
      }
    } catch (err) {
      alert("Error while saving task");
    }
  };

  /**Delete handler*/
  const handleDelete = async () => {
    if (!selectedTask.task_id) return;
    try {
      const res = await fetch(
        `http://localhost:8801/api/tasks/delete/${selectedTask.task_id}`,
        { method: "DELETE", credentials: "include" }
      );
      const result = await res.json();
      if (result.success) {
        await fetchTasks();
        onClose?.();
      } else {
        alert(result.message || "Failed to delete task");
      }
    } catch (err) {
      alert("Error deleting task");
    }
  };

  /**Handle when user selects a suggestion*/
  const handleSelectSlot = (start, end) => {
    const [startDateVal, startTimeVal] = start.split(" ");
    const [endDateVal, endTimeVal] = end.split(" ");

    setValue("startDate", startDateVal);
    setValue("startTime", startTimeVal);
    setValue("endDate", endDateVal);
    setValue("endTime", endTimeVal);

    // Clear dueDate → task becomes assigned
    setValue("dueDate", "");
    setValue("dueTime", "");
  };

  return (
    <div className="popup-wrapper">
      <div className="popup">
        <h2>{mode === "edit" ? "Edit Task" : "Create Task"}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <label>
            Title:
            <input {...register("title")} placeholder="Enter task title" />
          </label>

          {/* All Day */}
          <label>
            All Day:
            <input type="checkbox" {...register("allDay")} />
          </label>

          {/* Dates */}
          <label>
            Start Date:
            <input type="date" {...register("startDate")} />
          </label>
          <label>
            End Date:
            <input type="date" {...register("endDate")} />
          </label>

          {/* Times if not all day */}
          {!allDay && (
            <>
              <label>
                Start Time:
                <input type="time" {...register("startTime")} />
              </label>
              <label>
                End Time:
                <input type="time" {...register("endTime")} />
              </label>
            </>
          )}

          {/* Duration */}
          <label>
            Duration:
            <input type="time" {...register("duration")} />
          </label>

          {/* Due Date & Time */}
          <label>
            Due Date:
            <input type="date" {...register("dueDate")} />
          </label>
          <label>
            Due Time:
            <input type="time" {...register("dueTime")} />
          </label>

          {/* Buffer Time */}
          <label>
            Buffer Time (minutes):
            <input type="number" {...register("bufferTime")} />
          </label>

          {/* Categories */}
          <label>
            Categories:
            <select multiple {...register("categories")}>
              {userCategories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </label>

          {/* Location */}
          <label>
            Location:
            <select {...register("locationId")}>
              <option value="">Select Location</option>
              {userLocations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.icon} {loc.location_name}
                </option>
              ))}
            </select>
          </label>

          {/* Note */}
          <label>
            Note:
            <textarea {...register("note")} maxLength={160} />
          </label>

          {/* SuggestionPanel */}
          {dueDate && duration && (
            <SuggestionPanel
              dueDate={dueDate}
              duration={duration}
              bufferTime={watch("bufferTime")}
              locationId={watch("locationId")}
              userEmail={userEmail}
              onSelectSlot={handleSelectSlot}
            />
          )}

          {/* Buttons */}
          <div className="buttons">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{mode === "edit" ? "Update" : "Save"}</button>
            {mode === "edit" && (
              <button type="button" onClick={handleDelete} className="delete">
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
