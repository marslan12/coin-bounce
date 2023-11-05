const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");
const blogControlller = require("../controllers/blogController");
const commentController = require("../controllers/commentController");

const router = express.Router();

//User Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
router.get("/refresh", authController.refresh);

//Blog Routes
router.post("/blog", auth, blogControlller.create);
router.get("/blog", auth, blogControlller.getAll);
router.get("/blog/:id", auth, blogControlller.getById);
router.put("/blog", auth, blogControlller.update);
router.delete("/blog/:id", auth, blogControlller.delete);

//Comment Routes
router.post("/comment", auth, commentController.create);
router.get("/comment/:blog", auth, commentController.getAll);

module.exports = router;
