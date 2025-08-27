// controllers/travelController.js
const axios = require("axios");

function clampMode(mode = "driving") {
  const m = String(mode || "").toLowerCase();
  return ["driving", "walking", "bicycling", "transit"].includes(m)
    ? m
    : "driving";
}

// POST /api/travel/matrix
// body: { legs: [{from:{lat,lng}, to:{lat,lng}}...], mode: "driving" }
async function distanceMatrix(req, res) {
  try {
    const legs = Array.isArray(req.body?.legs) ? req.body.legs : [];
    const mode = clampMode(req.body?.mode);

    if (legs.length === 0) {
      return res.json({ success: true, results: [], meters: 0, seconds: 0 });
    }

    // הופכים לרשימות מוצרים/יעדים בצורה "אלכסונית":
    // origins: A|B|C
    // destinations: B|C|D
    const origins = legs.map((l) => `${l.from.lat},${l.from.lng}`).join("|");
    const destinations = legs.map((l) => `${l.to.lat},${l.to.lng}`).join("|");

    // אפשר לשים time-dependent עם departure_time=now
    const params = {
      origins,
      destinations,
      mode,
      units: "metric",
      departure_time: "now",
      key: process.env.GOOGLE_MAPS_API_KEY,
    };

    const { data } = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      { params }
    );

    if (data.status !== "OK") {
      return res.status(502).json({
        success: false,
        message: `Distance Matrix error: ${data.status}`,
        raw: data,
      });
    }

    // האלמנט המתאים לכל רגל נמצא במיקום [i][i] (אלכסון)
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
      const d = el.distance?.value ?? 0; // מטרים
      const s = el.duration_in_traffic?.value ?? el.duration?.value ?? 0; // שניות
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
