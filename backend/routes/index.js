const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

const router = express.Router();

//User Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
router.get("/refresh", authController.refresh);

module.exports = router;
