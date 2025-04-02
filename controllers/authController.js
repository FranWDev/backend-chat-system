const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../models/db.js");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

exports.auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(); 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return decoded.isAdmin === 1
      ? res.redirect("/admin")
      : res.redirect("/user");
  } catch (err) {
    res.clearCookie("token");
    return next();
  }
};

exports.register = async (req, res) => {

  await Promise.all([
    body("username")
      .trim()
      .notEmpty()
      .withMessage("El nombre de usuario es obligatorio")
      .run(req),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Correo inválido")
      .normalizeEmail()
      .run(req),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres")
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register", {
      message: { text: errors.array()[0].msg, type: "error" },
    });
  }

  const { username, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res.render("register", {
      message: { text: "Las contraseñas no coinciden", type: "error" },
    });
  }

  const conn = await pool.getConnection();
  try {

    const [existingUser] = await conn.execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.render("register", {
        message: { text: "Usuario o correo ya registrado", type: "error" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    const [user] = await conn.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email, isAdmin: user[0].isAdmin }, 
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.redirect("/user");
  } catch (err) {
    console.error(`Error al registrar usuario: ${err}`);
    res.status(500).render("register", {
      message: { text: "Error interno del servidor", type: "error" },
    });
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("login", {
      message: { text: "Todos los campos son obligatorios", type: "error" },
    });
  }

  const conn = await pool.getConnection();
  try {
    const [userInfo] = await conn.execute(
      "SELECT id, username, email, password, isAdmin FROM users WHERE username = ?",
      [username]
    );

    if (userInfo.length === 0) {
      return res.render("login", {
        message: { text: "Usuario o contraseña incorrectos", type: "error" },
      });
    }

    const user = userInfo[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render("login", {
        message: { text: "Usuario o contraseña incorrectos", type: "error" },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });
    res.redirect(user.isAdmin === 1 ? "/admin" : "/user");
  } catch (err) {
    console.error(`Error en login: ${err}`);
    res.status(500).render("login", {
      message: { text: "Error interno del servidor", type: "error" },
    });
  } finally {
    conn.release();
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.redirect("/auth/login");
};
