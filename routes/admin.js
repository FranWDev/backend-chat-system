const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", auth, isAdmin, adminController.redirect);
router.get("/getUser/:userId", auth, isAdmin, adminController.getUserInfo);
router.get("/userList", auth, isAdmin, adminController.getAllData);

module.exports = router;
