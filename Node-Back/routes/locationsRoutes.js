//locationsRoutes.js
const express = require("express");
const router = express.Router();

const locationsController = require("../controllers/locationsController");

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

module.exports = router;
