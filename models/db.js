const mysql = require("mysql2/promise");
const dotenv = require("dotenv")
dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "DB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getUser = "SELECT * FROM users WHERE username = ?";
const getAllUsers = "SELECT id, username FROM users";
const getOtherUsers = "SELECT id, username FROM users WHERE id != ?";
const getUserId = "SELECT id FROM users WHERE username = ? OR email = ?";
const getMessage = "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp";
const addUser = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
const addMessage = "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
const recuperateMessages = "SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? ORDER BY timestamp DESC LIMIT 5"
module.exports = {
  pool,
  queries: {
    getUser,
    getAllUsers,
    getOtherUsers,
    getMessage,
    getUserId,
    addUser,
    addMessage,
    recuperateMessages
  }
};
