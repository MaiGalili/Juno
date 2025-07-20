//locationsRoutes.js
//Import required modules
const express = require("express");
const router = express.Router();

// Add this line to check if the controller loads
console.log("Loading locations controller...");
const locationsController = require("../controllers/locationsController");
console.log("Locations controller loaded:", Object.keys(locationsController));

// === ROUTES ===

// Get all locations for the logged-in user
router.get("/", locationsController.getLocations);

// Add a new location
router.post("/add-location", locationsController.addLocation);

// Delete a location by its ID
router.delete("/:id", locationsController.deleteLocation);

// Update a location's details
router.put("/update-location", locationsController.updateLocation);

// Log to confirm routes were registered
console.log("Locations routes registered");

//Get all locations
router.post("/getAll", locationsController.getAllLocations);

module.exports = router;
