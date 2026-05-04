const express = require("express");
const {
  listChatRooms,
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
} = require("../controllers/chatRoomController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, listChatRooms);
router.post("/", authMiddleware, createChatRoom);
router.post("/:roomId/join", authMiddleware, joinChatRoom);
router.post("/:roomId/leave", authMiddleware, leaveChatRoom);

module.exports = router;
