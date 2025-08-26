// services/googleDistanceService.js
const fetch = require("node-fetch");

// Simple in-memory cache (OK for one-node dev; replace with Redis in prod)
const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheKey({ from, to, mode, departSec }) {
  const f = `${from.lat.toFixed(5)},${from.lng.toFixed(5)}`;
  const t = `${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
  // round depart time to 5-minute buckets to reuse results
  const bucket = Math.floor(departSec / 300) * 300;
  return `${f}|${t}|${mode}|${bucket}`;
}

async function distanceMatrixMinutes(from, to, mode = "driving", departSec) {
  if (!from || !to || from.lat == null || to.lat == null) return 0;

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn("[DM] No GOOGLE_MAPS_API_KEY set – using fallback");
    return null;
  }

  const key = cacheKey({ from, to, mode, departSec });
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.t < TTL_MS) return hit.v;

  const params = new URLSearchParams({
    origins: `${from.lat},${from.lng}`,
    destinations: `${to.lat},${to.lng}`,
    mode, // driving | walking | bicycling | transit
    departure_time: String(
      Math.max(departSec, Math.floor(Date.now() / 1000) + 60)
    ), // at least near-future
    units: "metric",
    key: process.env.GOOGLE_MAPS_API_KEY,
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`DM HTTP ${resp.status}`);
    const json = await resp.json();
    const el = json?.rows?.[0]?.elements?.[0];

    if (!resp.ok || !el || el.status !== "OK") {
      console.warn("[DM] Fallback:", {
        http: resp.status,
        elStatus: el?.status,
        error: json?.error_message,
      });
      return null; // force fallback
    }
    
    // Prefer duration_in_traffic (driving); otherwise duration
    const secs =
      (el.duration_in_traffic && el.duration_in_traffic.value) ||
      (el.duration && el.duration.value) ||
      0;

    const mins = Math.ceil(secs / 60);
    cache.set(key, { v: mins, t: now });
    return mins;
  } catch (e) {
    // Fall back to 0 (we’ll replace with haversine at call-site)
    return null;
  }
}

module.exports = { distanceMatrixMinutes };
