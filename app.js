const express = require("express");
const path = require("node:path");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIo = require("socket.io");
const { auth, isAdmin } = require("./middlewares/authMiddleware");
const app = express();
const server = http.createServer(app);
const port = 3000;
const pool = require("./models/db");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, content } = data;

    try {
      await pool.execute(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
        [senderId, receiverId, content]
      );

      const [message] = await pool.execute(
        "SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? ORDER BY timestamp DESC LIMIT 5",
        [senderId, receiverId]
      );

      io.to(socket.id).emit("receiveMessage", message[0]);
      socket.broadcast.emit("receiveMessage", message[0]);
    } catch (err) {
      console.error("Error al guardar mensaje:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });

  socket.on("getMessages", async (data) => {
    const { senderId, receiverId } = data;

    try {
      const [messages] = await pool.execute(
        "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp",
        [senderId, receiverId, receiverId, senderId]
      );

      socket.emit("messageHistory", messages);
    } catch (err) {
      console.error("Error al obtener mensajes:", err);
    }
  });
});

app.get("/", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.redirect("/auth/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.redirect(decoded?.isAdmin === 1 ? "/admin" : "/user");
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      path: "/",
    });
    console.log(err);
    return res.redirect("/auth/login");
  }
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
