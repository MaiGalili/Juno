const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signUp", authController.signUp);
router.post("/login", authController.login);
router.get("/getSession", authController.getSession);
router.post("/logout", authController.logout);
router.post("/getEmail", authController.getEmail);
router.post("/sendResetCode", authController.sendResetCode);
router.put("/resetPassword", authController.resetPassword);
router.post("/sendMail", authController.sendMail);

module.exports = router;
