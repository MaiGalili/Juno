const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// יצירת משימה
router.post("/create/assigned", taskController.createAssignedTask);
router.post("/create/waiting", taskController.createWaitingTask);

// שליפת משימות ללוח שנה
router.post("/assigned", taskController.getAssignedTasks);

// עריכת משימות
router.put("/update/assigned/:task_id", taskController.updateAssignedTask);
router.put("/update/waiting/:task_id", taskController.updateWaitingTask);

//  מחיקת משימה
router.delete("/delete/:task_id", taskController.deleteTask);

module.exports = router;
