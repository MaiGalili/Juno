// routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Create tasks
router.post("/create/assigned", taskController.createAssignedTask);
router.post("/create/waiting", taskController.createWaitingTask);

// Get tasks
router.post("/assigned", taskController.getAssignedTasks);
// New: fetch all waiting‑list tasks
router.post("/waiting", taskController.getWaitingTasks);

// Update tasks
router.put("/update/assigned/:task_id", taskController.updateAssignedTask);
router.put("/update/waiting/:task_id", taskController.updateWaitingTask);

// Delete task (assigned or waiting—cascade will clean up)
router.delete("/delete/:task_id", taskController.deleteTask);

module.exports = router;
