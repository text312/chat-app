const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

async function listRoomMessages(req, res) {
  const { roomId } = req.params;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    const isMember = room.members.some(
      (memberId) => memberId.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({ message: "You must join this room first." });
    }

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "username email");

    return res.json(messages.reverse());
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch room messages." });
  }
}

module.exports = { listRoomMessages };
