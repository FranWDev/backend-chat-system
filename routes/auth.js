const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", authController.auth, (req, res) =>
  res.render("login", { message: null })
);
router.get("/login", authController.auth, (req, res) =>
  res.render("login", { message: null })
);
router.get("/register", authController.auth, (req, res) =>
  res.render("register", { message: null })
);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
