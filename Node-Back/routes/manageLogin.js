const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/sinUp", (req, res) => {
  console.log("Received body:", req.body);

  const { email, password } = req.body;
  console.log(email, password);
  const query = "INSERT INTO users (email, password) VALUES (?, ?)";

  db.query(query, [email, password], (err, result) => {
    if (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Error creating user" });
    } else {
      res.status(200).json({ message: "User created successfully" });
    }
  });
});

module.exports = router;
