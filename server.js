const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📂 Message storage file
const MESSAGE_FILE = "messages.json";

// 🧠 Read saved messages
function readMessages() {
  if (!fs.existsSync(MESSAGE_FILE)) return [];
  return JSON.parse(fs.readFileSync(MESSAGE_FILE));
}

// 💾 Save messages
function saveMessages(messages) {
  fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
}

io.on("connection", socket => {
  console.log("🍊 User connected");

  // 📤 Send saved messages to user when they come online
  const messages = readMessages();
  socket.emit("chatHistory", messages);

  socket.on("message", data => {
    const messages = readMessages();
    messages.push({
      username: data.username,
      message: data.message,
      time: Date.now()
    });

    saveMessages(messages);   // 💾 save message
    io.emit("message", data); // 📡 send to online users
  });

  socket.on("typing", user => {
    socket.broadcast.emit("typing", user);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🍊 Tangerine running on port", PORT);
});
