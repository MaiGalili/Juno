// controllers/travelController.js
const axios = require("axios");

// Normalize travel mode to one of the supported Google modes
function clampMode(mode = "driving") {
  const m = String(mode || "").toLowerCase();
  return ["driving", "walking", "bicycling", "transit"].includes(m)
    ? m
    : "driving";
}

// Builds Distance Matrix request with N origins and N destinations (pairwise), expecting result on diagonal [i][i].
//  Sums total distance (meters) and duration (seconds) across all legs.
//  Uses duration_in_traffic when available (requires departure_time=now and is relevant mainly for driving).
async function distanceMatrix(req, res) {
  try {
    const legs = Array.isArray(req.body?.legs) ? req.body.legs : [];
    const mode = clampMode(req.body?.mode);

    // Early return: empty input yields empty result but success=true
    if (legs.length === 0) {
      return res.json({ success: true, results: [], meters: 0, seconds: 0 });
    }

    // Build pipe-separated coordinate lists:
    // origins:       A | B | C
    // destinations:  B | C | D
    // The i-th origin pairs with the i-th destination (we'll read [i][i]).
    const origins = legs.map((l) => `${l.from.lat},${l.from.lng}`).join("|");
    const destinations = legs.map((l) => `${l.to.lat},${l.to.lng}`).join("|");

   const params = new URLSearchParams({
     origins,
     destinations,
     mode,
     units: "metric",
     departure_time: "now",
     key: process.env.GOOGLE_MAPS_API_KEY, 
   });

   const resp = await fetch(
     `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`
   );

   const data = await resp.json();

   if (data.status !== "OK") {
     return res.status(502).json({
       success: false,
       message: `Distance Matrix error: ${data.status}`,
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
     const s = el.duration_in_traffic?.value ?? el.duration?.value ?? 0;
     meters += d;
     seconds += s;
     return { i, distance_meters: d, duration_seconds: s, status: "OK" };
   });

    res.json({ success: true, results, meters, seconds });
  } catch (err) {
    console.error("distanceMatrix error:", err?.message || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { distanceMatrix };
