//taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/create", taskController.createTask);
router.post("/assigned", taskController.getAssignedTasks);

module.exports = router;
