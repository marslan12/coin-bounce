const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

//User Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
