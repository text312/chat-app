const express = require("express");
const { listRoomMessages } = require("../controllers/chatMessageController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:roomId", authMiddleware, listRoomMessages);

module.exports = router;
