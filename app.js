const express = require("express");
const path = require("node:path");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIo = require("socket.io");
const { auth, isAdmin } = require("./middlewares/authMiddleware");
const app = express();
const server = http.createServer(app);
const port = 3000;
const {pool, queries} = require("./models/db");
const cookieParser = require("cookie-parser");
const {encrypt, decrypt} = require("./services/encyptionService")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
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
        queries.addMessage, [senderId, receiverId, content]
      );

      const [message] = await pool.execute(
        queries.getLastestMessage, [senderId, receiverId]
      );
      io.to(socket.id).emit("receiveMessage", message[0]);
    } catch (err) {
      console.error("Error al guardar mensaje:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Cliente desconectado");
  });

  socket.on("getMessages", async (data) => {
    const { senderId, receiverId } = data;

    try {
      const [messages] = await pool.execute(
        queries.getMessage, [senderId, receiverId, receiverId, senderId]
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
