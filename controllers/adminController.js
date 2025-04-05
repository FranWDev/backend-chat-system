const { pool, queries } = require("../models/db.js");

exports.verify = async (req, res) => {
  try {
    res.render("admin", {
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (err) {
    console.error(err);
    res.render("error");
  }
};

exports.getUserInfo = async (req, res) => {
  const { username } = req.body;
  const conn = await pool.getConnection();

  try {
    const [info] = await conn.execute(
      queries.getUser, [username]
    );
    conn.release();
    return res.render("user_info", {
      user: info,
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (err) {
    conn.release();
    console.error(err);
    res.render("error");
  }
};

exports.getAllData = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const [users] = await conn.execute(queries.getAllUsers);
    conn.release();
    return res.render("info", {
      users,
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (err) {
    conn.release();
    res.render("error");
  }
};
