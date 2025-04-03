const pool = require("../models/db.js");
const jwt = require("jsonwebtoken");

exports.saveMessage = async (senderId, receiverId, content) => {
  const conn = await pool.getConnection();

  try {
    const result = await conn.execute(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [senderId, receiverId, content]
    );
    conn.release();
    return result;
  } catch (err) {
    conn.release();
    console.error("Error al guardar mensaje:", err);
    throw err;
  }
};

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "El mensaje no puede estar vacío" });
  }

  try {
    await pool.execute(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [senderId, receiverId, content]
    );

    res.status(200).json({ message: "Mensaje enviado exitosamente" });
  } catch (err) {
    console.error("Error al enviar el mensaje:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const [messages] = await pool.execute(
      "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp",
      [senderId, receiverId, receiverId, senderId]
    );

    res.json({
      messages: Array.isArray(messages) ? messages : Object.values(messages),
    });
  } catch (err) {
    console.error("Error al obtener los mensajes:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

exports.isRouteManipulated = async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  const { senderId } = req.params;
  if (senderId == req.user.id) {
    return next();
  } else {
    return res.redirect("/user");
  }
};
