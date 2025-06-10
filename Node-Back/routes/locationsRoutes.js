const express = require("express");
const router = express.Router();

// Add this line to check if the controller loads
console.log("Loading locations controller...");
const locationsController = require("../controllers/locationsController");
console.log("Locations controller loaded:", Object.keys(locationsController));

router.get("/", locationsController.getLocations);
router.post("/add-location", locationsController.addLocation);
router.delete("/:id", locationsController.deleteLocation);
router.put("/", locationsController.updateLocation);

console.log("Locations routes registered");
module.exports = router;
