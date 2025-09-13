//travelRoutes.js
const express = require("express");
const router = express.Router();
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

// Normalize to supported modes
function clampMode(mode = "driving") {
  const m = String(mode || "").toLowerCase();
  return ["driving", "walking", "bicycling", "transit"].includes(m) ? m : "driving";
}

// Basic legs validator (prevents weird 500s from bad input)
function validLeg(l) {
  return l &&
    l.from && typeof l.from.lat === "number" && typeof l.from.lng === "number" &&
    l.to   && typeof l.to.lat   === "number" && typeof l.to.lng   === "number";
}

// Distance Matrix
router.post("/matrix", async (req, res) => {
  try {
    const legs = Array.isArray(req.body?.legs) ? req.body.legs : [];
    const mode = clampMode(req.body?.mode);

    if (legs.length === 0) {
      return res.json({ success: true, results: [], meters: 0, seconds: 0 });
    }
    if (!legs.every(validLeg)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid legs array" });
    }

    // Build diagonal lists
    const origins = legs.map((l) => `${l.from.lat},${l.from.lng}`);
    const destinations = legs.map((l) => `${l.to.lat},${l.to.lng}`);

    // Params: add departure_time for driving (traffic) and transit (required)
    const params = {
      origins,
      destinations,
      mode,
      units: "metric",
      key: process.env.GOOGLE_MAPS_API_KEY,
    };
    if (mode === "driving" || mode === "transit") {
      params.departure_time = "now";
    }

    const dmResp = await client.distancematrix({ params, timeout: 10000 });
    const data = dmResp?.data;

    if (!data || data.status !== "OK") {
      return res.status(502).json({
        success: false,
        message: `Distance Matrix error: ${data?.status || "NO_RESPONSE"}`,
        raw: data,
      });
    }

    let meters = 0;
    let seconds = 0;
    const results = legs.map((_, i) => {
      const el = data.rows?.[i]?.elements?.[i];
      if (!el || el.status !== "OK") {
        return {
          i,
          distance_meters: null,
          duration_seconds: null,
          status: el?.status || "NO_RESULT",
        };
      }
      const d = el.distance?.value ?? 0;
      // Prefer traffic-aware where available
      const s = el.duration_in_traffic?.value ?? el.duration?.value ?? 0;
      meters += d;
      seconds += s;
      return { i, distance_meters: d, duration_seconds: s, status: "OK" };
    });

    return res.json({ success: true, results, meters, seconds });
  } catch (e) {
    console.error("travel/matrix error:", e.response?.data || e.message || e);
    return res
      .status(500)
      .json({ success: false, message: "Distance Matrix failed" });
  }
});

module.exports = router;
