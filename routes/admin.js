const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const userController = require("../controllers/userController")
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", auth, isAdmin, adminController.redirect);
router.post("/chat", auth, isAdmin, userController.chat);
router.get("/users", auth, isAdmin, adminController.getAllData);
router.get("/users/:userId", auth, isAdmin, adminController.getUserInfo);

module.exports = router;
