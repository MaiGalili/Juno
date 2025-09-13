// components/mainPageComponents/taskPopup/SaveAsPDF/SaveAsPDF.jsx
import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

//Small format helpers (keep UI-friendly values)
function toInputDateString(date) {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function hhmm(str) {
  if (!str) return "";
  //  Accept HH:MM or HH:MM:SS; output HH:MM
  if (/^\d{1,2}:\d{2}$/.test(str)) return str.padStart(5, "0");
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.slice(0, 5);
  return str;
}

// A “waiting” task is identified by having due fields but no start fields
function isWaitingTask(task) {
  return !!(
    task?.task_duedate &&
    !task?.task_start_date &&
    !task?.task_start_time
  );
}

// Resolve category display names from selected IDs
function categoryNames(selectedIds, userCategories) {
  const set = new Set((selectedIds || []).map(String));
  const names = (userCategories || [])
    .filter((c) => set.has(String(c.category_id)))
    .map((c) => c.name);
  return names.length ? names.join(", ") : "";
}

// Build a readable location string using either custom address or a favorite
function resolveLocationString(task, userLocations) {
  if (task?.custom_location_address) {
    return task.custom_location_address;
  }
  if (task?.location_id) {
    const loc = (userLocations || []).find(
      (l) => String(l.location_id) === String(task.location_id)
    );
    if (loc?.address) return loc.address;
    if (loc?.location_address) return loc.location_address;
    if (loc?.location_name) return loc.location_name;
  }
  return "";
}

export default function SaveAsPDF({
  task,
  userCategories = [],
  userLocations = [],
  className,
}) {
  // Disable button when we don’t have a persistent task to export
  const disabled = !task || !task.task_id;

  const handleDownload = () => {
    if (disabled) return;

    // Initialize a clean PDF document
    const doc = new jsPDF();

    // Title
    const title = task?.task_title || "Task";
    doc.setFontSize(18);
    doc.text(title, 14, 18);

    // Decide which fields to render based on task type
    const waiting = isWaitingTask(task);

    // Build rows for the table: [["Field", "Value"], ...]
    const rows = [];

    // Type
    rows.push([
      "Type",
      waiting ? "Waiting (due task)" : "Assigned (scheduled)",
    ]);

    // Dates/times: assigned vs waiting
    if (!waiting) {
      rows.push([
        "Start Date",
        toInputDateString(task?.task_start_date) || "-",
      ]);
      rows.push([
        "End Date",
        toInputDateString(task?.task_end_date) ||
          toInputDateString(task?.task_start_date) ||
          "-",
      ]);
      rows.push(["Start Time", hhmm(task?.task_start_time) || "-"]);
      rows.push(["End Time", hhmm(task?.task_end_time) || "-"]);
    } else {
      rows.push(["Due Date", toInputDateString(task?.task_duedate) || "-"]);
      rows.push(["Due Time", hhmm(task?.task_duetime) || "-"]);
    }

    // Core fields (duration, all-day, repeat)
    rows.push(["Duration", hhmm(task?.task_duration) || "-"]);
    rows.push(["All Day", task?.task_all_day ? "Yes" : "No"]);

    const repeatStr =
      task?.task_repeat && task.task_repeat !== "none"
        ? `${task.task_repeat}${
            task?.repeat_until
              ? ` (until ${toInputDateString(task.repeat_until)})`
              : ""
          }`
        : "No";
    rows.push(["Repeat", repeatStr]);

    // Categories: support multiple shapes (objects / ids / single id)
    let catDisplay = "";
    if (Array.isArray(task?.categories) && task.categories.length) {
      catDisplay = task.categories
        .map((c) => c.name ?? c.category_name ?? c.categoryId ?? c)
        .join(", ");
    } else if (Array.isArray(task?.category_ids) && task.category_ids.length) {
      catDisplay = categoryNames(task.category_ids, userCategories);
    } else if (task?.category_id) {
      catDisplay = categoryNames([task.category_id], userCategories);
    }
    rows.push(["Categories", catDisplay || "-"]);

    // Location, Notes, Buffer
    rows.push(["Location", resolveLocationString(task, userLocations) || "-"]);
    rows.push(["Notes", task?.task_note || "-"]);
    const buffer = task?.buffer_time || task?.task_buffertime || "";
    const bufferHHMM = hhmm(buffer);
    rows.push(["Buffer Time", bufferHHMM || "-"]);

    // Render table
    autoTable(doc, {
      startY: 26,
      head: [["Field", "Value"]],
      body: rows,
      styles: { fontSize: 11, cellPadding: 3 },
      headStyles: { fillColor: [230, 230, 230] },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: "auto" },
      },
    });

    // Footer
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    doc.setFontSize(9);
    doc.text(`Generated: ${stamp}`, 14, doc.internal.pageSize.getHeight() - 10);

    const safeName = (title || "task").replace(/[^\w\-]+/g, "_");
    doc.save(`${safeName}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      className={className}
    >
      Save as PDF
    </button>
  );
}
