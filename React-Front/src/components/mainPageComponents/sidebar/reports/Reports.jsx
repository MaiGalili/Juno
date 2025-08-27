// Reports.jsx
import React, { useMemo, useState } from "react";
import s from "./reports.module.css";
import { format } from "date-fns";

// Helpers

// Rough distance (km) via haversine
function haversineKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return 0;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const speedKmhByMode = {
  driving: 35, // tune for your city
  walking: 5,
  bicycling: 15,
  transit: 25,
};

// Pull a friendly name + coords from a task
function getTaskLocation(task, locMap) {
  const raw = task?.raw || {};

  // 1) custom location (task/raw)
  const customLat =
    raw.custom_location_latitude ?? task?.custom_location_latitude;
  const customLng =
    raw.custom_location_longitude ?? task?.custom_location_longitude;
  const customAddr =
    raw.custom_location_address ?? task?.custom_location_address;
  if (customLat != null && customLng != null) {
    return {
      name: customAddr || "Custom place",
      lat: Number(customLat),
      lng: Number(customLng),
    };
  }

  // 2) favorite from the JOIN (server put them under raw.*)
  const rawLat =
    raw.location_latitude ?? raw.loc_latitude ?? raw.latitude ?? null;
  const rawLng =
    raw.location_longitude ?? raw.loc_longitude ?? raw.longitude ?? null;
  const rawName = raw.location_name || raw.location_address;
  if (rawLat != null && rawLng != null) {
    return {
      name: rawName || "Location",
      lat: Number(rawLat),
      lng: Number(rawLng),
    };
  }

  // 3) fallback by location_id via userLocations map
  const locId = task?.location_id ?? raw?.location_id ?? null; // <— also check raw
  if (locId != null && locMap) {
    const loc = locMap.get(String(locId));
    if (loc) {
      const lat = loc.location_latitude ?? loc.latitude ?? loc.lat ?? null;
      const lng = loc.location_longitude ?? loc.longitude ?? loc.lng ?? null;
      const name =
        loc.location_name ?? loc.name ?? loc.location_address ?? "Location";
      if (lat != null && lng != null) {
        return { name, lat: Number(lat), lng: Number(lng) };
      }
      return { name, lat: null, lng: null };
    }
  }

  return { name: "", lat: null, lng: null };
}

const toHM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

const parseTimeToMin = (hhmm = "00:00") => {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const endOfRange = (start, kind) => {
  const d = new Date(start);
  if (kind === "day") d.setDate(d.getDate() + 1);
  else if (kind === "week") d.setDate(d.getDate() + 7);
  else if (kind === "month") d.setMonth(d.getMonth() + 1);
  else if (kind === "year") d.setFullYear(d.getFullYear() + 1);
  return d;
};

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);

// CSV
function downloadCSV(filename, rows) {
  const header = Object.keys(rows[0] || {}).join(",");
  const body = rows
    .map((r) =>
      Object.values(r)
        .map(
          (v) =>
            `"${String(v ?? "")
              .replaceAll('"', '""')
              .replaceAll("\n", " ")}"`
        )
        .join(",")
    )
    .join("\n");
  const csv = header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports({
  open,
  onClose,
  tasks = [],
  userSettings, // { start_day_time, end_day_time }
  userLocations = [],
}) {
  const [kind, setKind] = useState("week"); // day | week | month | year
  const [start, setStart] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const startDate = useMemo(() => new Date(start), [start]);
  const endDate = useMemo(() => endOfRange(startDate, kind), [startDate, kind]);

  // Filter tasks that overlap the range
  const inRange = useMemo(() => {
    const a = startDate.getTime();
    const b = endDate.getTime();
    return tasks.filter((t) => {
      if (!t?.start || !t?.end) return false;
      const s = t.start.getTime();
      const e = t.end.getTime();
      return e > a && s < b; // overlap
    });
  }, [tasks, startDate, endDate]);

  // Duration minutes per task (clip to working day)
  const dayStartMin = parseTimeToMin(userSettings?.start_day_time || "08:00");
  const dayEndMin = parseTimeToMin(userSettings?.end_day_time || "21:00");

  const locMap = useMemo(() => {
    const m = new Map();
    for (const l of userLocations) m.set(String(l.location_id), l);
    return m;
  }, [userLocations]);

  function durationWithinWorkday(t) {
    if (!t?.start || !t?.end) return 0;
    // do not count all-day items as "scheduled hours"
    if (
      t.task_all_day === 1 ||
      t.task_all_day === true ||
      t?.raw?.task_all_day
    ) {
      return 0;
    }
    // Per day clipping (handles tasks that span multiple days)
    let sum = 0;
    const cur = new Date(Math.max(t.start.getTime(), startDate.getTime()));
    const stop = new Date(Math.min(t.end.getTime(), endDate.getTime()));

    // iterate day by day (fast enough; ranges are small)
    while (cur < stop) {
      const dayStr = format(cur, "yyyy-MM-dd");
      const dayStart = new Date(`${dayStr}T00:00:00`);
      const nextDay = new Date(dayStart);
      nextDay.setDate(nextDay.getDate() + 1);

      const segStart = new Date(Math.max(cur.getTime(), dayStart.getTime()));
      const segEnd = new Date(Math.min(stop.getTime(), nextDay.getTime()));

      const segStartMin = segStart.getHours() * 60 + segStart.getMinutes();
      const segEndMin = segEnd.getHours() * 60 + segEnd.getMinutes();

      const clippedStart = clamp(segStartMin, dayStartMin, dayEndMin);
      const clippedEnd = clamp(segEndMin, dayStartMin, dayEndMin);

      if (clippedEnd > clippedStart) sum += clippedEnd - clippedStart;

      cur.setDate(cur.getDate() + 1);
      cur.setHours(0, 0, 0, 0);
    }
    return sum;
  }

  const totals = useMemo(() => {
    let scheduledMin = 0;
    const byCategory = new Map();
    const byLocation = new Map();

    // --- NEW: prepare for travel between consecutive tasks
    const mode = (userSettings?.travel_mode || "driving").toLowerCase();
    const kmh = speedKmhByMode[mode] ?? 30;
    let travelKm = 0;
    let travelMin = 0;

    // Sort only the tasks in range by start for travel calc
    const sorted = [...inRange]
      .filter(
        (t) =>
          !(
            t.task_all_day === 1 ||
            t.task_all_day === true ||
            t?.raw?.task_all_day
          )
      )
      .sort((a, b) => a.start - b.start);

    for (const t of inRange) {
      const mins = durationWithinWorkday(t);
      scheduledMin += mins;

      // categories
      const cats = Array.isArray(t.categories) ? t.categories : [];
      if (cats.length === 0) {
        byCategory.set(
          "(Uncategorized)",
          (byCategory.get("(Uncategorized)") || 0) + mins
        );
      } else {
        cats.forEach((c) => {
          const key = c.category_name || c.name || "Category";
          byCategory.set(key, (byCategory.get(key) || 0) + mins);
        });
      }

      // locations (time spent at a location)
      const loc = getTaskLocation(t, locMap);
      if (loc.name) {
        byLocation.set(loc.name, (byLocation.get(loc.name) || 0) + mins);
      }
    }

    // --- NEW: travel legs between consecutive tasks with known coords
    for (let i = 0; i < sorted.length - 1; i++) {
      const A = getTaskLocation(sorted[i], locMap);
      const B = getTaskLocation(sorted[i + 1], locMap);
      if (A.lat == null || B.lat == null) continue;
      // if same place, skip
      if (A.lat === B.lat && A.lng === B.lng) continue;

      const km = haversineKm(A, B);
      travelKm += km;
      travelMin += Math.ceil((km / kmh) * 60);
    }

    // working capacity minutes across days in range
    let capacityMin = 0;
    const d = new Date(startDate);
    while (d < endDate) {
      capacityMin += Math.max(0, dayEndMin - dayStartMin);
      d.setDate(d.getDate() + 1);
    }
    const freeMin = Math.max(0, capacityMin - scheduledMin);

    const catRows = Array.from(byCategory.entries())
      .map(([name, mins]) => ({ name, mins }))
      .sort((a, b) => b.mins - a.mins);
    const locRows = Array.from(byLocation.entries())
      .map(([name, mins]) => ({ name, mins }))
      .sort((a, b) => b.mins - a.mins);

    return {
      scheduledMin,
      freeMin,
      capacityMin,
      catRows,
      locRows,
      travelKm,
      travelMin,
    };
  }, [
    inRange,
    startDate,
    endDate,
    dayStartMin,
    dayEndMin,
    userSettings?.travel_mode,
  ]);

  const exportCSV = () => {
    const rows = inRange.map((t) => {
      const loc = getTaskLocation(t, locMap);
      return {
        title: t.title,
        start: t.start ? format(t.start, "yyyy-MM-dd HH:mm") : "",
        end: t.end ? format(t.end, "yyyy-MM-dd HH:mm") : "",
        duration_min: durationWithinWorkday(t),
        categories: Array.isArray(t.categories)
          ? t.categories.map((c) => c.category_name || c.name).join("; ")
          : "",
        location: loc.name || "",
        note: t.note || "",
      };
    });
    downloadCSV(
      `report_${format(startDate, "yyyyMMdd")}_${format(
        endDate,
        "yyyyMMdd"
      )}.csv`,
      rows
    );
  };

  const exportSummaryCSV = () => {
    const rows = [
      { section: "Totals", name: "Tasks", value: inRange.length },
      {
        section: "Totals",
        name: "Scheduled (min)",
        value: totals.scheduledMin,
      },
      { section: "Totals", name: "Free (min)", value: totals.freeMin },
      { section: "Totals", name: "Capacity (min)", value: totals.capacityMin },
      { section: "Totals", name: "Travel (min)", value: totals.travelMin },
      {
        section: "Totals",
        name: "Distance (km)",
        value: totals.travelKm.toFixed(2),
      },
      ...totals.catRows.map((r) => ({
        section: "By Category",
        name: r.name,
        value: r.mins,
      })),
      ...totals.locRows.map((r) => ({
        section: "By Location",
        name: r.name,
        value: r.mins,
      })),
    ];
    downloadCSV(
      `summary_${format(startDate, "yyyyMMdd")}_${format(
        endDate,
        "yyyyMMdd"
      )}.csv`,
      rows
    );
  };

  if (!open) return null;

  return (
    <div className={s.backdrop}>
      <div className={s.modal}>
        <div className={s.header}>
          <h2>Create Report</h2>
          <button className={s.iconBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={s.controls}>
          <div className={s.group}>
            <div className={s.label}>Duration</div>
            <div className={s.segmented}>
              {["day", "week", "month", "year"].map((k) => (
                <button
                  key={k}
                  className={k === kind ? s.segActive : s.seg}
                  onClick={() => setKind(k)}
                >
                  {k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={s.group}>
            <label className={s.label}>Start date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={s.input}
            />
          </div>

          <div className={s.group}>
            <div className={s.label}>Range</div>
            <div className={s.rangeBox}>
              {format(startDate, "dd/MM/yyyy")} –{" "}
              {format(endDate, "dd/MM/yyyy")}
            </div>
          </div>
        </div>

        <div className={s.preview}>
          <div className={s.kpis}>
            <div className={s.kpi}>
              <div className={s.kpiTitle}>Tasks</div>
              <div className={s.kpiValue}>{inRange.length}</div>
            </div>
            <div className={s.kpi}>
              <div className={s.kpiTitle}>Scheduled</div>
              <div className={s.kpiValue}>{toHM(totals.scheduledMin)}</div>
            </div>
            <div className={s.kpi}>
              <div className={s.kpiTitle}>Free time</div>
              <div className={s.kpiValue}>{toHM(totals.freeMin)}</div>
            </div>
            <div className={s.kpi}>
              <div className={s.kpiTitle}>Capacity</div>
              <div className={s.kpiValue}>{toHM(totals.capacityMin)}</div>
            </div>
          </div>

          <div className={s.kpi}>
            <div className={s.kpiTitle}>Travel time</div>
            <div className={s.kpiValue}>{toHM(totals.travelMin)}</div>
          </div>
          <div className={s.kpi}>
            <div className={s.kpiTitle}>Distance</div>
            <div className={s.kpiValue}>{totals.travelKm.toFixed(1)} km</div>
          </div>

          <div className={s.columns}>
            <div className={s.col}>
              <h4>By Category</h4>
              <ul className={s.list}>
                {totals.catRows.map((r) => (
                  <li key={r.name} className={s.row}>
                    <span className={s.rowName}>{r.name}</span>
                    <span className={s.rowVal}>{toHM(r.mins)}</span>
                  </li>
                ))}
                {totals.catRows.length === 0 && (
                  <li className={s.muted}>
                    No categorized time in this range.
                  </li>
                )}
              </ul>
            </div>

            <div className={s.col}>
              <h4>By Location</h4>
              <ul className={s.list}>
                {totals.locRows.map((r) => (
                  <li key={r.name} className={s.row}>
                    <span className={s.rowName}>{r.name}</span>
                    <span className={s.rowVal}>{toHM(r.mins)}</span>
                  </li>
                ))}
                {totals.locRows.length === 0 && (
                  <li className={s.muted}>No location time in this range.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className={s.actions}>
          <button className={s.btnGhost} onClick={onClose}>
            Close
          </button>
          <button className={s.btnGhost} onClick={exportSummaryCSV}>
            Summary CSV
          </button>
          <button className={s.btnPrimary} onClick={exportCSV}>
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
