const express = require("express");
const router = express.Router();
const locationsController = require("../controllers/locationsController");

router.get("/", locationsController.getLocations);
router.post("/", locationsController.addLocation);
router.delete("/:id", locationsController.deleteLocation);
router.put("/", locationsController.updateLocation);

module.exports = router;
