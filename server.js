require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat_app";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("user", "username email");

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

io.on("connection", (socket) => {
  socket.on("join", async ({ username, email }) => {
    if (!username || !email) {
      socket.emit("error", { message: "Username and email are required." });
      return;
    }

    try {
      const user = await User.findOneAndUpdate(
        { email },
        { username },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      socket.data.userId = user._id;
      socket.emit("joined", { userId: user._id, username: user.username });
    } catch (error) {
      socket.emit("error", { message: "Unable to join chat." });
    }
  });

  socket.on("chat:message", async ({ content }) => {
    if (!socket.data.userId || !content) {
      return;
    }

    try {
      const message = await Message.create({
        user: socket.data.userId,
        content,
      });

      const populatedMessage = await message.populate("user", "username email");
      io.emit("chat:message", populatedMessage);
    } catch (error) {
      socket.emit("error", { message: "Unable to send message." });
    }
  });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected.");

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
