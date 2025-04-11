const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth } = require("../middlewares/authMiddleware");

router.get("/", auth, userController.user);
router.post("/chat", auth, userController.chat);

module.exports = router;