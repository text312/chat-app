require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const User = require("./models/User");
const Message = require("./models/Message");
const ChatRoom = require("./models/ChatRoom");
const authRoutes = require("./routes/authRoutes");
const chatRoomRoutes = require("./routes/chatRooms");
const chatMessagesRoutes = require("./routes/chatMessages");
const { authMiddleware } = require("./middleware/authMiddleware");

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
process.env.JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat-rooms", chatRoomRoutes);
app.use("/api/chat-messages", chatMessagesRoutes);

app.get("/api/messages", authMiddleware, async (req, res) => {
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
  socket.on("room:join", async ({ roomId, userId }) => {
    if (!roomId || !userId) {
      return;
    }

    try {
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        socket.emit("error", { message: "Chat room not found." });
        return;
      }

      const isMember = room.members.some(
        (memberId) => memberId.toString() === userId
      );

      if (!isMember) {
        room.members.push(userId);
        await room.save();
      }

      socket.join(roomId);
      socket.data.currentRoomId = roomId;
      socket.data.userId = userId;

      const updatedRoom = await ChatRoom.findById(roomId).populate(
        "members",
        "username email"
      );

      io.to(roomId).emit("room:users", {
        roomId,
        users: updatedRoom ? updatedRoom.members : [],
      });

      const history = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("user", "username email");

      socket.emit("room:history", {
        roomId,
        messages: history.reverse(),
      });
    } catch (error) {
      socket.emit("error", { message: "Unable to join room." });
    }
  });

  socket.on("room:leave", async ({ roomId, userId }) => {
    if (!roomId || !userId) {
      return;
    }

    try {
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        return;
      }

      room.members = room.members.filter(
        (memberId) => memberId.toString() !== userId
      );
      await room.save();

      socket.leave(roomId);
      socket.data.currentRoomId = null;

      const updatedRoom = await ChatRoom.findById(roomId).populate(
        "members",
        "username email"
      );

      io.to(roomId).emit("room:users", {
        roomId,
        users: updatedRoom ? updatedRoom.members : [],
      });
    } catch (error) {
      socket.emit("error", { message: "Unable to leave room." });
    }
  });

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

  socket.on("chat:message", async ({ roomId, content }) => {
    const activeRoomId = roomId || socket.data.currentRoomId;
    if (!socket.data.userId || !activeRoomId || !content) {
      return;
    }

    try {
      const room = await ChatRoom.findById(activeRoomId);
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      const isMember = room.members.some(
        (memberId) => memberId.toString() === socket.data.userId
      );
      if (!isMember) {
        socket.emit("error", { message: "Join room before sending messages." });
        return;
      }

      const message = await Message.create({
        room: activeRoomId,
        user: socket.data.userId,
        content,
      });

      const populatedMessage = await message.populate("user", "username email");
      io.to(activeRoomId).emit("chat:message", populatedMessage);
    } catch (error) {
      socket.emit("error", { message: "Unable to send message." });
    }
  });

  socket.on("disconnect", async () => {
    const { currentRoomId, userId } = socket.data;

    if (!currentRoomId || !userId) {
      return;
    }

    try {
      const room = await ChatRoom.findById(currentRoomId);
      if (!room) {
        return;
      }

      room.members = room.members.filter(
        (memberId) => memberId.toString() !== userId
      );
      await room.save();

      const updatedRoom = await ChatRoom.findById(currentRoomId).populate(
        "members",
        "username email"
      );
      io.to(currentRoomId).emit("room:users", {
        roomId: currentRoomId,
        users: updatedRoom ? updatedRoom.members : [],
      });
    } catch (error) {
      // Ignore cleanup errors on disconnect.
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
