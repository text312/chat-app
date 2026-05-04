const ChatRoom = require("../models/ChatRoom");

async function listChatRooms(req, res) {
  try {
    const rooms = await ChatRoom.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email")
      .populate("members", "username email");

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat rooms." });
  }
}

async function createChatRoom(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Room name is required." });
  }

  try {
    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      return res.status(409).json({ message: "Chat room already exists." });
    }

    const room = await ChatRoom.create({
      name,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    const populatedRoom = await room.populate(
      "createdBy members",
      "username email"
    );

    return res.status(201).json(populatedRoom);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create chat room." });
  }
}

async function joinChatRoom(req, res) {
  const { roomId } = req.params;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    const alreadyMember = room.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!alreadyMember) {
      room.members.push(req.user.id);
      await room.save();
    }

    const populatedRoom = await ChatRoom.findById(roomId)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    return res.json(populatedRoom);
  } catch (error) {
    return res.status(500).json({ message: "Failed to join chat room." });
  }
}

async function leaveChatRoom(req, res) {
  const { roomId } = req.params;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );
    await room.save();

    const populatedRoom = await ChatRoom.findById(roomId)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    return res.json(populatedRoom);
  } catch (error) {
    return res.status(500).json({ message: "Failed to leave chat room." });
  }
}

module.exports = {
  listChatRooms,
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
};
