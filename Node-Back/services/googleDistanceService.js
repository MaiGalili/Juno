// services/googleDistanceService.js
const fetch = require("node-fetch");

// Simple in-memory cache
const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

// Stable cache key for a (from -> to, mode, departure) query
function cacheKey({ from, to, mode, departSec }) {
  const fLat = Number(from.lat),
    fLng = Number(from.lng);
  const tLat = Number(to.lat),
    tLng = Number(to.lng);
  const f = `${fLat.toFixed(5)},${fLng.toFixed(5)}`;
  const t = `${tLat.toFixed(5)},${tLng.toFixed(5)}`;
  const bucket = Math.floor(departSec / 300) * 300; // 300s = 5 minutes
  return `${f}|${t}|${mode}|${bucket}`;
}

// Query Google Distance Matrix and return ETA in minutes (rounded up)
async function distanceMatrixMinutes(from, to, mode = "driving", departSec) {
  // Missing coordinates -> signal caller to fallback
  if (!from || !to || from.lat == null || to.lat == null) return 0;

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn("[DM] No GOOGLE_MAPS_API_KEY set: Using fallback");
    return null;
  }

  // Check cache
  const key = cacheKey({ from, to, mode, departSec });
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.t < TTL_MS) return hit.v;

  // Build Distance Matrix request
  const params = new URLSearchParams({
    origins: `${from.lat},${from.lng}`,
    destinations: `${to.lat},${to.lng}`,
    mode, // driving | walking | bicycling | transit
    //  Departure at least slightly in the future
    departure_time: String(
      Math.max(departSec, Math.floor(Date.now() / 1000) + 60)
    ),
    units: "metric",
    key: process.env.GOOGLE_MAPS_API_KEY,
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`DM HTTP ${resp.status}`);

    const json = await resp.json();
    const el = json?.rows?.[0]?.elements?.[0];

    // API-level failures
    if (!resp.ok || !el || el.status !== "OK") {
      console.warn("[DM] Fallback:", {
        http: resp.status,
        elStatus: el?.status,
        error: json?.error_message,
      });
      return null; // force fallback
    }

    // Prefer duration_in_traffic when available (mainly for driving mode)
    const secs =
      (el.duration_in_traffic && el.duration_in_traffic.value) ||
      (el.duration && el.duration.value) ||
      0;

    const mins = Math.ceil(secs / 60);
    cache.set(key, { v: mins, t: now });
    return mins;
  } catch (e) {
    // Network/transport errors
    return null;
  }
}

module.exports = { distanceMatrixMinutes };
