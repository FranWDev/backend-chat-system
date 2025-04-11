const { pool, queries } = require("../models/db.js");

exports.redirect = async (req, res) => {
  try {
    res.render("admin", {
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.getUserInfo = async (req, res) => {
  const id = req.params;
  try {
    const [info] = await pool.execute(queries.getUserById, [id.userId]);
    return res.render("user_info", {
      user: info,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.getAllData = async (req, res) => {
  try {
    const [users] = await pool.execute(queries.getAllUsers);
    return res.render("info", {
      users,
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
