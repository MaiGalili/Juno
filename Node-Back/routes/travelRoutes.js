const express = require("express");
const router = express.Router();
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

router.post("/matrix", async (req, res) => {
  try {
    const { legs = [], mode = "driving" } = req.body || {};
    if (!Array.isArray(legs) || legs.length === 0) {
      return res.json({ success: true, meters: 0, seconds: 0 });
    }

    // שימוש ב-Distance Matrix כמטריצה ולוקחים את האלכסון (זוג-זוג)
    const origins = legs.map((l) => `${l.from.lat},${l.from.lng}`);
    const destinations = legs.map((l) => `${l.to.lat},${l.to.lng}`);

    const dmResp = await client.distancematrix({
      params: {
        origins,
        destinations,
        mode, // 'driving' | 'walking' | 'bicycling' | 'transit'
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 10000,
    });

    // סכימה אלכסונית: i->i
    let meters = 0;
    let seconds = 0;
    const rows = dmResp.data?.rows || [];
    for (let i = 0; i < legs.length; i++) {
      const cell = rows[i]?.elements?.[i];
      if (cell && cell.status === "OK") {
        meters += cell.distance?.value || 0;
        seconds += cell.duration?.value || 0;
      }
    }

    return res.json({ success: true, meters, seconds });
  } catch (e) {
    // לוג מועיל כדי להבין למה נכשל (הרשאות/מפתח/חסימה וכו')
    console.error("travel/matrix error:", e.response?.data || e.message || e);
    return res
      .status(500)
      .json({ success: false, message: "Distance Matrix failed" });
  }
});

module.exports = router;
