// components/mainPageComponents/topbar/settings/Settings.jsx
import React, { useEffect, useState } from "react";
import styles from "./settings.module.css";

export default function Settings({ open, onClose }) {
  const [form, setForm] = useState({
    defult_buffer: "",
    start_day_time: "",
    end_day_time: "",
    waiting_list_max: "",
    default_location_id: "",
    travel_mode: "driving",
  });
  const [locations, setLocations] = useState([]);

  // Load settings + locations only when the modal opens.
  useEffect(() => {
    if (!open) return;
    (async () => {
      const s = await fetch("http://localhost:8801/api/users/settings", {
        credentials: "include",
      }).then((r) => r.json());
      if (s?.success) {
        setForm({
          defult_buffer: s.defult_buffer || "00:10:00",
          start_day_time: s.start_day_time || "08:00:00",
          end_day_time: s.end_day_time || "21:00:00",
          waiting_list_max: s.waiting_list_max ?? 10,
          default_location_id: s.default_location_id ?? "",
          travel_mode: s.travel_mode || "driving",
        });
      }
      const loc = await fetch("http://localhost:8801/api/locations", {
        credentials: "include",
      }).then((r) => r.json());
      // Server may return plain array or {data: [...]}
      setLocations(Array.isArray(loc) ? loc : loc?.data || []);
    })();
  }, [open]);

  // Persist changes
  const save = async () => {
    const res = await fetch("http://localhost:8801/api/users/settings", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((r) => r.json());
    if (res?.success) onClose();
    else alert(res?.message || "Save failed");
  };

  if (!open) return null;

  return (
    <div className={styles.popupWrapper}>
      <div className={styles.popup}>
        <h2 className={styles.title}>Settings</h2>
        <div className={styles.popupBody}>
          {/* Buffer between tasks*/}
          <label>
            Default buffer (HH:MM)
            <input
              type="time"
              step="60"
              value={form.defult_buffer}
              onChange={(e) =>
                setForm((f) => ({ ...f, defult_buffer: e.target.value }))
              }
            />
          </label>

          {/* Working day window (affects reports/suggestions) */}
          <label>
            Day starts at
            <input
              type="time"
              step="60"
              value={form.start_day_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_day_time: e.target.value }))
              }
            />
          </label>

          <label>
            Day ends at
            <input
              type="time"
              step="60"
              value={form.end_day_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_day_time: e.target.value }))
              }
            />
          </label>

          {/* Waiting-list capacity for unscheduled tasks */}
          <label className={styles.field}>
            Waiting list max
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.waiting_list_max}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  waiting_list_max: Number(e.target.value),
                }))
              }
            />
          </label>

          {/* Default place */}
          <label className={styles.field}>
            Default location
            <select
              className={styles.select}
              value={form.default_location_id ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  // empty string means "no default" (server normalizes to NULL)
                  default_location_id: e.target.value || null,
                }))
              }
            >
              <option value="">(None)</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.location_name}
                </option>
              ))}
            </select>
          </label>

          {/*Maches backend set: driving/walking/bicycling/transit */}
          <label className={styles.field}>
            Default travel mode
            <select
              className={styles.select}
              value={form.travel_mode || "driving"}
              onChange={(e) =>
                setForm((f) => ({ ...f, travel_mode: e.target.value }))
              }
            >
              <option value="driving">Driving</option>
              <option value="walking">Walking</option>
              <option value="bicycling">Bicycling</option>
              <option value="transit">Public Transit</option>
            </select>
          </label>
        </div>

        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.buttonSave}`}
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
