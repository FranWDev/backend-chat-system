const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error en autenticación:", err);
    return res.redirect("/auth/login"); 
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin === 1) {
    return next(); 
  } else {
    return res.redirect("/user");
  }
};
