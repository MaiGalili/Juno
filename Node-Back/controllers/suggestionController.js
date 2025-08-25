// suggestionController.js
const taskRepo = require("../repositories/taskRepo");
const userRepo = require("../repositories/userRepo");
const locationRepo = require("../repositories/locationRepo");
const { distanceMatrixMinutes } = require("../services/googleDistanceService");

// --- helpers ---
// fallback haversine (keep yours)
function haversineMinutes(from, to, mode = "driving") {
  if (!from || !to || from.lat == null || to.lat == null) return 0;
  const kmhByMode = { driving: 35, walking: 5, bicycling: 15, transit: 25 };
  const kmh = kmhByMode[mode] ?? 30;
  const R = 6371,
    toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat),
    dLon = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLon / 2) ** 2;
  const d = 2 * R * Math.asin(Math.sqrt(a));
  return Math.ceil((d / kmh) * 60);
}

async function travelMinutes(from, to, mode, departSec) {
  // try Google
  const g = await distanceMatrixMinutes(from, to, mode, departSec);
  if (g != null) return g;
  // fallback
  return haversineMinutes(from, to, mode);
}

// Make it async and compute 2 legs per gap using departure times near the slot
async function buildFreeWithTravelAsync(
  busyWithLoc,
  dayStartMin,
  dayEndMin,
  neededMin,
  bufferMin,
  candidateLoc,
  stepMin,
  maxPerGap,
  travelMode,
  dateEpochSec // unix seconds for 00:00 of the day
) {
  const res = [];
  const guards = [
    { start: dayStartMin, end: dayStartMin, loc: null },
    ...busyWithLoc,
    { start: dayEndMin, end: dayEndMin, loc: null },
  ];

  for (let i = 0; i < guards.length - 1; i++) {
    const A = guards[i];
    const B = guards[i + 1];

    // Representative departure times:
    const departA = dateEpochSec + (A.end + bufferMin) * 60; // soon after A ends
    const latestCandidateStart = B.start - bufferMin - neededMin; // latest start that fits
    const departToB = dateEpochSec + (latestCandidateStart + neededMin) * 60; // arriving at B window

    const tFromA = candidateLoc
      ? await travelMinutes(A.loc, candidateLoc, travelMode, departA)
      : 0;

    const tToB = candidateLoc
      ? await travelMinutes(candidateLoc, B.loc, travelMode, departToB)
      : 0;

    let earliest = A.end + tFromA;
    const latestFinish = B.start - bufferMin - tToB;

    if (latestFinish - earliest < neededMin) continue;
    earliest = Math.ceil(earliest / stepMin) * stepMin;

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

const parseHHMM = (s) => {
  if (!s) return 0;
  const [h, m] = s.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(
    mins % 60
  ).padStart(2, "0")}`;
const dayKey = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
function toYMD(input) {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : fmtDate(d);
}

// --- controller ---
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

    const user = await userRepo.getSettings(userEmail); // MUST include travel_mode in SELECT
    const dayStart = user.start_day_time || "08:00:00";
    const dayEnd = user.end_day_time || "21:00:00";
    const defaultBuffer = user.defult_buffer || "00:10:00";

    const needMin = parseHHMM(duration);
    if (needMin <= 0)
      return res.status(400).json({
        success: false,
        message: "duration must be greater than 00:00",
      });

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
    }

    if (fmtDate(searchEndDate) < fmtDate(searchStartDate)) {
      return res.json({ success: true, data: [] });
    }

    // Fetch existing assigned tasks in range (with locations)
    const assigned = await taskRepo.getAssignedBetween(
      userEmail,
      fmtDate(searchStartDate),
      fmtDate(searchEndDate)
    );

    const busyByDay = new Map();
    for (const t of assigned) {
      const dStr =
        typeof t.task_start_date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(t.task_start_date)
          ? t.task_start_date
          : fmtDate(new Date(t.task_start_date));
      if (!dStr) continue;

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
      if (!(eMin > sMin)) continue;

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

    // Merge overlaps per day
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
        }
      }
      busyByDay.set(dStr, merged);
    }

    // Resolve candidate location once
    let candidateLoc = null;
    const candLat = customLat ?? customCoords?.lat;
    const candLng = customLng ?? customCoords?.lng;
    if (candLat != null && candLng != null) {
      candidateLoc = { lat: Number(candLat), lng: Number(candLng) };
    } else if (locationId) {
      const loc = await locationRepo.getUserLocationById(
        userEmail,
        Number(locationId)
      );
      if (loc && loc.lat != null && loc.lng != null) {
        candidateLoc = { lat: Number(loc.lat), lng: Number(loc.lng) };
      }
    }

    console.log("candidateLoc", { locationId, candLat, candLng, candidateLoc });

    const results = [];
    let d = new Date(searchStartDate);
    const last = addDays(searchEndDate, 1);
    const todayCutoff = Math.ceil((nowMin + minLeadMin) / stepMin) * stepMin;

    while (d < last && results.length < offset + limit + 6) {
      const dateStr = fmtDate(d);

      let dayStartMin = parseHHMM(dayStart.slice(0, 5));
      let dayEndMin = parseHHMM(dayEnd.slice(0, 5));

      const y = d.getFullYear(),
        m = d.getMonth(),
        dd = d.getDate();
      const dayEpochSec = Math.floor(
        new Date(y, m, dd, 0, 0, 0).getTime() / 1000
      );

      if (dueDateYMD && dateStr === dueDateYMD && endTimeLimitMin != null) {
        dayEndMin = Math.min(dayEndMin, endTimeLimitMin);
      }

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
        let free = await buildFreeWithTravelAsync(
          busyWithLoc,
          dayStartMin,
          dayEndMin,
          needMin,
          bufMin,
          candidateLoc,
          stepMin,
          3,
          user.travel_mode || "driving",
          dayEpochSec
        );
        if (dateStr === todayStr)
          free = free.filter((f) => f.start >= todayCutoff);

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

    return res.json({
      success: true,
      data: results.slice(offset, offset + limit),
    });
  } catch (err) {
    console.error("getSuggestions error:", err.stack || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
