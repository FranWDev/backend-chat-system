const {pool, queries} = require("../models/db.js");

exports.redirect = async (req, res) => {
  try {
    const [users] = await pool.execute(
      queries.getOtherUsers, [req.user.id]
    );

    return res.render("user", {
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
      users: users,
    });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
};
