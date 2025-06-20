//taskRoutes.js
//Import required modules
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

//Create task
router.post("/create/assigned", taskController.createAssignedTask);
router.post("/create/waiting", taskController.createWaitingTask);

//Get tasks
router.post("/assigned", taskController.getAssignedTasks);
//missing get for waiting list tasks

//Edit tasks
router.put("/update/assigned/:task_id", taskController.updateAssignedTask);
router.put("/update/waiting/:task_id", taskController.updateWaitingTask);

// Delete task
router.delete("/delete/:task_id", taskController.deleteTask);

module.exports = router;
