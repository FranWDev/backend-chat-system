const { pool, queries } = require("../models/db.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.user = async (req, res) => {
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
    return user[0].isAdmin == 1 ? res.redirect("/admin") : res.render("user");
  } catch (err) {
    console.log("Error de autenticacion: ", err);
  }
};

exports.chat = async (req, res) => {
  try {
    const [users] = await pool.execute(queries.getOtherUsers, [req.user.id]);

    return res.render("chat", {
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
      users: users,
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return res.redirect("/user");
  }
};
