// SaveAsPDF.jsx
import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  // allow HH:MM or HH:MM:SS
  if (/^\d{1,2}:\d{2}$/.test(str)) return str.padStart(5, "0");
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.slice(0, 5);
  return str;
}

function isWaitingTask(task) {
  return !!(
    task?.task_duedate &&
    !task?.task_start_date &&
    !task?.task_start_time
  );
}

function categoryNames(selectedIds, userCategories) {
  const set = new Set((selectedIds || []).map(String));
  const names = (userCategories || [])
    .filter((c) => set.has(String(c.category_id)))
    .map((c) => c.name);
  return names.length ? names.join(", ") : "";
}

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
  const disabled = !task || !task.task_id;

  const handleDownload = () => {
    if (disabled) return;

    const doc = new jsPDF();

    // Title
    const title = task?.task_title || "Task";
    doc.setFontSize(18);
    doc.text(title, 14, 18);

    // Decide which date/time fields to show
    const waiting = isWaitingTask(task);

    // Fields for table
    const rows = [];

    // Assigned vs Waiting
    rows.push([
      "Type",
      waiting ? "Waiting (due task)" : "Assigned (scheduled)",
    ]);

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

    rows.push(["Duration", hhmm(task?.task_duration) || "-"]);
    rows.push(["All Day", task?.task_all_day ? "Yes" : "No"]);

    // Repeat
    const repeatStr =
      task?.task_repeat && task.task_repeat !== "none"
        ? `${task.task_repeat}${
            task?.repeat_until
              ? ` (until ${toInputDateString(task.repeat_until)})`
              : ""
          }`
        : "No";
    rows.push(["Repeat", repeatStr]);

    // Categories: support both `categories` (objects) or `category_ids` (ids)
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

    // Location
    rows.push(["Location", resolveLocationString(task, userLocations) || "-"]);

    // Notes
    rows.push(["Notes", task?.task_note || "-"]);

    // Buffer
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
