//suggestionController.js
const taskRepo = require("../repositories/taskRepo");
const userRepo = require("../repositories/userRepo");

function parseHHMM(s) {
  if (!s) return 0;
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}
function dayKey(dateStr) {
  // YYYY-MM-DD -> Date (local)
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDate(d) {
  // -> YYYY-MM-DD (local)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Build free slots for a single day given busy intervals and day bounds
function buildFreeIntervalsForDay(
  busy,
  dayStartMin,
  dayEndMin,
  neededMin,
  bufferMin
) {
  // busy: array of [startMin, endMin] sorted non-overlapping
  const res = [];
  let cursor = dayStartMin;

  for (const [bStart, bEnd] of busy) {
    // check gap [cursor, bStart)
    const gap = bStart - cursor;
    if (gap >= neededMin + bufferMin) {
      res.push([cursor, cursor + neededMin]); // we return just one slot per gap start
      // NOTE: we could also push multiple “sliding” options within the gap; נשאיר MVP
    }
    cursor = Math.max(cursor, bEnd + bufferMin); // hop after busy + buffer
    if (cursor > dayEndMin) break;
  }

  // tail gap
  if (dayEndMin - cursor >= neededMin) {
    res.push([cursor, cursor + neededMin]);
  }
  return res;
}

// Get suggestions for a task
exports.getSuggestions = async (req, res) => {
  try {
   const userEmail = req.user?.email || req.session?.user?.email;
   if (!userEmail)
     return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      duration,
      dueDate,
      dueTime,
      startDate,
      bufferTime,
      locationId,
      customAddress,
      offset = 0,
      limit = 3,
    } = req.body || {};

    if (!duration || (!dueDate && !startDate)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "duration and (dueDate OR startDate) are required",
        });
    }

    // user settings
    const user = await userService.getSettings(userEmail);
    const dayStart = user.start_day_time || "08:00:00";
    const dayEnd = user.end_day_time || "21:00:00";
    const defaultBuffer = user.defult_buffer || "00:10:00";

    const needMin = parseHHMM(duration);
    const bufMin = parseHHMM((bufferTime || defaultBuffer).slice(0, 5));

    // define search window
    let searchStartDate,
      searchEndDate,
      endTimeLimitMin = null;

    if (startDate) {
      //Search in the same day
      searchStartDate = dayKey(startDate);
      searchEndDate = dayKey(startDate);
    } else {
      //not include due date
      searchStartDate = new Date(); // from today
      // Zero hours for search
      searchStartDate.setHours(0, 0, 0, 0);

      searchEndDate = dayKey(dueDate);
      //dosent search after due time
      if (dueTime) endTimeLimitMin = parseHHMM(dueTime);
    }

    // get assigned tasks in the search window
    const assigned = await taskService.getAssignedBetween(
      userEmail,
      fmtDate(searchStartDate),
      fmtDate(searchEndDate)
    );
    // create a busyByDay map
    const busyByDay = new Map(); // key: YYYY-MM-DD -> [[s,e],...]
    for (const t of assigned) {
      // expected format
      const dStr = t.task_start_date; // only single day
      const sMin = parseHHMM((t.task_start_time || "").slice(0, 5));
      const eMin = parseHHMM((t.task_end_time || "").slice(0, 5));
      if (!busyByDay.has(dStr)) busyByDay.set(dStr, []);
      busyByDay.get(dStr).push([sMin, eMin]);
    }
    // sort and merge busy intervals
    for (const [dStr, arr] of busyByDay) {
      arr.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const iv of arr) {
        if (!merged.length || iv[0] > merged[merged.length - 1][1]) {
          merged.push(iv.slice());
        } else {
          merged[merged.length - 1][1] = Math.max(
            merged[merged.length - 1][1],
            iv[1]
          );
        }
      }
      busyByDay.set(dStr, merged);
    }

    //run  until we have enough
    const results = [];
    let d = new Date(searchStartDate);
    const last = addDays(searchEndDate, 1); // exclusive

    while (d < last && results.length < offset + limit + 6) {
      // space between tasks 6
      const dateStr = fmtDate(d);

      let dayStartMin = parseHHMM(dayStart.slice(0, 5));
      let dayEndMin = parseHHMM(dayEnd.slice(0, 5));

      // אם זה dueDate עם dueTime – גבול עליון לשעות
      if (dueDate && dateStr === dueDate && endTimeLimitMin != null) {
        dayEndMin = Math.min(dayEndMin, endTimeLimitMin);
      }

      // אל תציע שליליות
      if (dayEndMin > dayStartMin) {
        const busy = busyByDay.get(dateStr) || [];
        const free = buildFreeIntervalsForDay(
          busy,
          dayStartMin,
          dayEndMin,
          needMin,
          bufMin
        );

        for (const [s, e] of free) {
          results.push({
            startDate: dateStr,
            endDate: dateStr,
            startTime: toHHMM(s),
            endTime: toHHMM(e),
            // אופציונלי: meta לסיבה/עלות/נסיעה וכו’
            meta: undefined,
          });
          if (results.length >= offset + limit) break;
        }
      }

      if (results.length >= offset + limit) break;
      d = addDays(d, 1);
    }

    const page = results.slice(offset, offset + limit);

    return res.json({ success: true, data: page });
  } catch (err) {
    console.error("getSuggestions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
