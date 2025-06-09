const express = require("express");
const router = express.Router();
const locationsController = require("../controllers/locationsController");

router.get("/", locationsController.getLocations);
router.post("/", locationsController.addLocation);
router.delete("/:id", locationsController.deleteLocation);

module.exports = router;
