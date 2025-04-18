const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { pool, queries } = require("../models/db.js");

exports.auth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const [user] = await pool.execute(queries.getUser, [req.user.user]);

    if (user[0].id != req.user.id) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/",
      });
      res.redirect("/auth/login");
    }

    return next();
  } catch (err) {
    console.error("Error en autenticación:", err);
    return res.redirect("/auth/login");
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.redirect("/auth/login");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const [user] = await pool.execute(queries.getIfAdmin, [req.user.email]);

    if (!user[0]) {
      return res.redirect("/auth/login");
    }
    return user[0].isAdmin == 1 ? next() : res.redirect("/user");
  } catch (err) {
    console.log("Error de autenticacion: ", err);
  }
};
