const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", auth, isAdmin, adminController.verify);

router.post("/get_user_info", auth, isAdmin, adminController.getUserInfo);
router.post("/get_all_data", auth, isAdmin, adminController.getAllData);

module.exports = router;