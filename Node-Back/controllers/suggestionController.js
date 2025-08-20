//suggestionController.js
const taskRepo = require("../repositories/taskRepo");
const userRepo = require("../repositories/userRepo");

// Haversine helper: minutes at ~30 km/h city average (tweak as you like)
function travelMinutes(from, to, kmh = 30) {
  if (!from || !to || from.lat == null || to.lat == null) return 0;
  const R = 6371,
    toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLon / 2) ** 2;
  const d = 2 * R * Math.asin(Math.sqrt(a)); // km
  return Math.ceil((d / kmh) * 60); // minutes
}

// Build suggestions inside gaps, respecting:
// prevTask → travelToCandidate + candidate + buffer + travelCandidateToNext ← nextTask
function buildFreeWithTravel(
  busyWithLoc, // [{start,end,loc}] sorted & merged
  dayStartMin,
  dayEndMin,
  neededMin,
  bufferMin,
  candidateLoc, // {lat,lng} or null
  stepMin = Math.max(15, bufferMin),
  maxPerGap = 3
) {
  const res = [];
  const guards = [
    { start: dayStartMin, end: dayStartMin, loc: null }, // "start of day"
    ...busyWithLoc,
    { start: dayEndMin, end: dayEndMin, loc: null }, // "end of day"
  ];

  for (let i = 0; i < guards.length - 1; i++) {
    const A = guards[i]; // previous busy block (or day start)
    const B = guards[i + 1]; // next busy block (or day end)

    const tFromA = travelMinutes(A.loc, candidateLoc); // A -> candidate
    const tToB = travelMinutes(candidateLoc, B.loc); // candidate -> B

    // Earliest we can start after A finishes (including travel)
    let earliest = A.end + tFromA;
    // Latest we must finish before B starts (leave buffer + travel to B)
    const latestFinish = B.start - bufferMin - tToB;

    // No room for the candidate?
    if (latestFinish - earliest < neededMin) continue;

    // Snap earliest to the step grid
    earliest = Math.ceil(earliest / stepMin) * stepMin;

    // Generate up to maxPerGap stepped options inside this gap
    let count = 0;
    for (let s = earliest; s + neededMin <= latestFinish; s += stepMin) {
      res.push({
        start: s,
        end: s + neededMin,
        meta: `+${tFromA}m travel / +${tToB}m next`,
      });
      if (++count >= maxPerGap) break;
    }
  }

  return res;
}

function parseHHMM(s) {
  if (!s) return 0;
  const [h, m] = s.slice(0, 5).split(":").map(Number);
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

// suggestionController.js – add helper:
function toYMD(input) {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input; // already Y-M-D
  const d = new Date(input);
  if (!isNaN(d.getTime())) return fmtDate(d); // fmtDate => YYYY-MM-DD
  return null;
}

// Get suggestions for a task
exports.getSuggestions = async (req, res) => {
  try {
    const userEmail = req.session?.userEmail;
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
      customLat,
      customLng,
      customCoords,
      nowYMD,
      nowMinOfDay,
      offset = 0,
      limit = 3,
    } = req.body || {};

    if (!duration || (!dueDate && !startDate)) {
      return res.status(400).json({
        success: false,
        message: "duration and (dueDate OR startDate) are required",
      });
    }

    const dueDateYMD = toYMD(dueDate);
    const startDateYMD = toYMD(startDate);

    const user = await userRepo.getSettings(userEmail);
    const dayStart = user.start_day_time || "08:00:00";
    const dayEnd = user.end_day_time || "21:00:00";
    const defaultBuffer = user.defult_buffer || "00:10:00";

    const needMin = parseHHMM(duration);
    if (needMin <= 0) {
      return res.status(400).json({
        success: false,
        message: "duration must be greater than 00:00",
      });
    }
    const bufMin = parseHHMM(bufferTime || defaultBuffer);
    const stepMin = Math.max(15, bufMin);

    const todayStr = toYMD(nowYMD) || fmtDate(new Date());
    const parsedNow = Number(nowMinOfDay);
    const nowMin = Number.isFinite(parsedNow)
      ? parsedNow
      : new Date().getHours() * 60 + new Date().getMinutes();
    const minLeadMin = Math.max(bufMin, 30);

    let searchStartDate = dayKey(todayStr);
    let searchEndDate,
      endTimeLimitMin = null;

    if (startDateYMD) {
      const start = dayKey(startDateYMD);
      const today = dayKey(todayStr);
      searchStartDate = start < today ? today : start;
      searchEndDate = dayKey(startDateYMD);
    } else if (dueDateYMD) {
      if (dueTime) {
        searchEndDate = dayKey(dueDateYMD);
        endTimeLimitMin = parseHHMM(dueTime);
      } else {
        searchEndDate = addDays(dayKey(dueDateYMD), -1);
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Missing dueDate/startDate" });
    }

    if (fmtDate(searchEndDate) < fmtDate(searchStartDate)) {
      return res.json({ success: true, data: [] });
    }

    const assigned = await taskRepo.getAssignedBetween(
      userEmail,
      fmtDate(searchStartDate),
      fmtDate(searchEndDate)
    );

    const busyByDay = new Map();

    // 1) Build busyByDay with normalized date/time and location
    for (const t of assigned) {
      // --- normalize date to 'YYYY-MM-DD'
      const dStr =
        typeof t.task_start_date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(t.task_start_date)
          ? t.task_start_date
          : fmtDate(new Date(t.task_start_date));
      if (!dStr) continue;

      // --- normalize times to 'HH:MM', then to minutes
      const startHHMM =
        typeof t.task_start_time === "string"
          ? t.task_start_time
          : toHHMM(
              new Date(t.task_start_time).getHours() * 60 +
                new Date(t.task_start_time).getMinutes()
            );
      const endHHMM =
        typeof t.task_end_time === "string"
          ? t.task_end_time
          : toHHMM(
              new Date(t.task_end_time).getHours() * 60 +
                new Date(t.task_end_time).getMinutes()
            );

      const sMin = parseHHMM(startHHMM);
      const eMin = parseHHMM(endHHMM);
      //avoid empty range
      if (!(eMin > sMin)) continue;

      // --- location (if any)
      let loc = null;
      if (
        t.custom_location_latitude != null &&
        t.custom_location_longitude != null
      ) {
        loc = {
          lat: Number(t.custom_location_latitude),
          lng: Number(t.custom_location_longitude),
        };
      } else if (t.location_latitude != null && t.location_longitude != null) {
        loc = {
          lat: Number(t.location_latitude),
          lng: Number(t.location_longitude),
        };
      }

      if (!busyByDay.has(dStr)) busyByDay.set(dStr, []);
      busyByDay.get(dStr).push({ start: sMin, end: eMin, loc });
    }

    // 2) Merge overlaps per day (keep earliest block's loc)
    for (const [dStr, arr] of busyByDay) {
      arr.sort((a, b) => a.start - b.start);
      const merged = [];
      for (const iv of arr) {
        if (!merged.length || iv.start > merged[merged.length - 1].end) {
          merged.push({ ...iv });
        } else {
          merged[merged.length - 1].end = Math.max(
            merged[merged.length - 1].end,
            iv.end
          );
          // keep loc from earliest block (good enough for travel-from)
        }
      }
      busyByDay.set(dStr, merged);
    }

    // Candidate location
    let candidateLoc = null;
    const candLat = customLat ?? customCoords?.lat;
    const candLng = customLng ?? customCoords?.lng;
    if (candLat != null && candLng != null) {
      candidateLoc = { lat: Number(candLat), lng: Number(candLng) };
    } else if (locationId) {
      // Optional: resolve favorite lat/lng here if you want strict travel;
      // otherwise keep null => 0 travel for "anywhere".
    }

    const results = [];
    let d = new Date(searchStartDate);
    const last = addDays(searchEndDate, 1);

    console.log("[suggestions]", { todayStr, nowMin, minLeadMin, stepMin });

    // compute a robust "today cutoff" in minutes from midnight, aligned to stepMin
    const todayCutoff = Math.ceil((nowMin + minLeadMin) / stepMin) * stepMin;

    while (d < last && results.length < offset + limit + 6) {
      const dateStr = fmtDate(d);

      // day bounds from user settings
      let dayStartMin = parseHHMM(dayStart.slice(0, 5));
      let dayEndMin = parseHHMM(dayEnd.slice(0, 5));

      // if there is a dueTime on the dueDate, cap the day end
      if (dueDateYMD && dateStr === dueDateYMD && endTimeLimitMin != null) {
        dayEndMin = Math.min(dayEndMin, endTimeLimitMin);
      }

      // if today, don’t allow anything before (now + lead), snapped to step
      if (dateStr === todayStr) {
        dayStartMin = Math.max(dayStartMin, nowMin + minLeadMin);
        dayStartMin = Math.ceil(dayStartMin / stepMin) * stepMin;
        if (dayStartMin >= dayEndMin) {
          d = addDays(d, 1);
          continue;
        }
      }

      if (dayEndMin - dayStartMin >= needMin) {
        const busyWithLoc = busyByDay.get(dateStr) || [];

        // NOTE: 'let' (not 'const') because we filter it for "today"
        let free = buildFreeWithTravel(
          busyWithLoc,
          dayStartMin,
          dayEndMin,
          needMin,
          bufMin,
          candidateLoc,
          stepMin,
          3
        );

        // Drop any option that starts before the "today cutoff"
        if (dateStr === todayStr) {
          free = free.filter((f) => f.start >= todayCutoff);
        }

        for (const f of free) {
          results.push({
            startDate: dateStr,
            endDate: dateStr,
            startTime: toHHMM(f.start),
            endTime: toHHMM(f.end),
            meta: f.meta,
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
