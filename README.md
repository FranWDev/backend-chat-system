 # backend-chat-system
🔐 Secure Chat with Node.js

A secure and scalable real-time messaging platform powered by Node.js, featuring JWT authentication, RESTful API design, and WebSocket-based communication.

🚀 Core Features

✔ JWT Authentication
- Role-based access (Admin/User)
- Password hashing with bcryptjs
- Protected routes with middleware

✔ RESTful API Design
- Endpoints following REST conventions
- Express.js backend architecture
- MySQL connection pooling

✔ Real-time Communication
- WebSocket implementation with Socket.io
- Message history persistence
- Online status tracking

✔ Security Best Practices
- Input validation with express-validator
- Environment variable configuration
- Async error handling

💻 Tech Stack
- Backend: Node.js | Express.js | MySQL | EJS
- Security: JWT | bcryptjs | express-validator  
- Real-time: Socket.io  
- DevOps: Dotenv | Nodemon  

📂 Project Structure
```
src/
├── controllers/       # Business logic (Auth, Chat, Admin)
├── middlewares/       # JWT auth & validations
├── models/            # Connection pool and queries
├── public/            # Static assets (CSS, JS, images)
├── routes/            # RESTful endpoint definitions
├── services/          # Reusable services
├── views/             # EJS templates
├── .env               # Environment variables
├── .sql               # DB schema export
├── app.js             # Express + Socket.io setup
└── package.json       # Dependencies & scripts
```
🛠️ Setup & Installation
- Prerequisites
Node.js installed
XAMPP or another MySQL server

- Clone repo: git clone [repo-url]
- Install dependencies: ```npm install```
- Configure .env file
- Start MySQL in Xampp
- Click the Shell button in XAMPP and type: ```mysql -u root -p``` (do not type any password)
- Copy and paste the database (.sql file)
- Start the server: ```npm start```
- Register two users and initiate a real-time chat session to verify functionality.
- If you want to test an admin user, simply modify an existing user:
  
In the Xampp shell:
```
UPDATE users
SET isAdmin = 1
WHERE username = '[your_account_username]';
```
🌟 Why This Project?
Demonstrates professional-grade backend skills:

✅ Clean architecture (MVC pattern)

✅ Production-ready practices (connection pooling, env vars)

✅ API security fundamentals
