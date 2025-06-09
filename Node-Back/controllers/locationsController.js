require("dotenv").config();
const axios = require("axios");

async function addLocation(req, res) {
  res.json({ message: "Add Location stub" });
}

async function getLocations(req, res) {
  res.json({ message: "Get Locations stub" });
}

async function deleteLocation(req, res) {
  res.json({ message: "Delete Location stub" });
}

module.exports = {
  addLocation,
  getLocations,
  deleteLocation,
};
