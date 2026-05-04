import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  fetchChatRooms,
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
} from "../api/chatRoomsApi";

const SOCKET_URL = "http://localhost:5000";

function useChatRooms({ token, user }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const socket = useMemo(() => io(SOCKET_URL, { autoConnect: false }), []);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    socket.connect();

    socket.on("room:users", ({ roomId, users }) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === roomId ? { ...room, members: users } : room
        )
      );
    });

    return () => {
      socket.off("room:users");
      socket.disconnect();
    };
  }, [socket, token, user]);

  async function loadRooms() {
    if (!token) {
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const data = await fetchChatRooms(token);
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateRoom(name) {
    if (!token) {
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await createChatRoom(token, name);
      await loadRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinRoom(roomId) {
    if (!token || !user) {
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await joinChatRoom(token, roomId);
      socket.emit("room:join", { roomId, userId: user.id });
      setCurrentRoomId(roomId);
      await loadRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLeaveRoom(roomId) {
    if (!token || !user) {
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await leaveChatRoom(token, roomId);
      socket.emit("room:leave", { roomId, userId: user.id });
      if (roomId === currentRoomId) {
        setCurrentRoomId(null);
      }
      await loadRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    rooms,
    currentRoomId,
    socket,
    isLoading,
    error,
    loadRooms,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
  };
}

export default useChatRooms;
