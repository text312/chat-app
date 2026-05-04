import { useEffect, useState } from "react";
import { fetchRoomMessages } from "../api/chatMessagesApi";

function useRoomMessages({ socket, token, user, roomId }) {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket || !token || !user?.id || !roomId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    async function bootstrapRoom() {
      try {
        const history = await fetchRoomMessages(token, roomId);
        if (mounted) {
          setMessages(history);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      }

      socket.emit("room:join", { roomId, userId: user.id });
    }

    function onHistory({ roomId: eventRoomId, messages: roomMessages }) {
      if (eventRoomId === roomId) {
        setMessages(roomMessages);
      }
    }

    function onChatMessage(message) {
      if (message.room === roomId || message.room?._id === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    }

    bootstrapRoom();
    socket.on("room:history", onHistory);
    socket.on("chat:message", onChatMessage);

    return () => {
      mounted = false;
      socket.off("room:history", onHistory);
      socket.off("chat:message", onChatMessage);
      socket.emit("room:leave", { roomId, userId: user.id });
    };
  }, [socket, token, user?.id, roomId]);

  async function sendMessage(content) {
    if (!socket || !roomId || !content.trim()) {
      return;
    }

    setError("");
    setIsSending(true);
    try {
      socket.emit("chat:message", { roomId, content: content.trim() });
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }

  return {
    messages,
    isSending,
    error,
    sendMessage,
  };
}

export default useRoomMessages;
