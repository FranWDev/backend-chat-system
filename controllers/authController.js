const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, queries } = require("../models/db.js");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  const token = await req.cookies?.token;

  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        path: "/",
      });
      return res.redirect("/auth/login");
    }

    req.user = decoded;
    next();
  });
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

  try {
    const [existingUser] = await pool.execute(queries.getUserId, [
      username,
      email,
    ]);

    if (existingUser.length > 0) {
      return res.render("register", {
        message: { text: "Usuario o correo ya registrado", type: "error" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(queries.addUser, [username, email, hashedPassword]);

    const [user] = await pool.execute(queries.getUser, [username]);
    const token = jwt.sign(
      {
        id: user[0].id,
        email: user[0].email,
        user: user[0].username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.redirect("/user");
  } catch (err) {
    console.error(`Error al registrar usuario: ${err}`);
    res.status(500).render("register", {
      message: { text: "Error interno del servidor", type: "error" },
    });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("login", {
      message: { text: "Todos los campos son obligatorios", type: "error" },
    });
  }

  try {
    const [userInfo] = await pool.execute(queries.getUser, [username]);

    if (userInfo.length === 0) {
      return res.render("login", {
        message: { text: "Usuario o contraseña incorrectos", type: "error" },
      });
    }

    const passwordMatch = await bcrypt.compare(password, userInfo[0].password);

    if (!passwordMatch) {
      return res.render("login", {
        message: { text: "Usuario o contraseña incorrectos", type: "error" },
      });
    }

    const token = jwt.sign(
      {
        id: userInfo[0].id,
        user: userInfo[0].username,
        email: userInfo[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.redirect(userInfo[0].isAdmin === 1 ? "/admin" : "/user");
  } catch (err) {
    console.error(`Error en login: ${err}`);
    res.status(500).render("login", {
      message: { text: "Error interno del servidor", type: "error" },
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    path: "/",
  });
  res.redirect("/auth/login");
};
