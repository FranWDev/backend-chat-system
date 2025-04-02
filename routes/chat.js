const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/sendMessage", chatController.sendMessage);
router.post("/saveMessage", chatController.saveMessage)
router.get("/getMessages/:senderId/:receiverId", chatController.isRouteManipulated, chatController.getMessages)

module.exports = router;
