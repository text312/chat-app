import { useEffect } from "react";
import CreateChatRoomForm from "./CreateChatRoomForm";
import ChatRoomsList from "./ChatRoomsList";
import ChatRoomMessages from "./ChatRoomMessages";
import useChatRooms from "../hooks/useChatRooms";

function ChatRoomManager({ token, user }) {
  const {
    rooms,
    currentRoomId,
    socket,
    isLoading,
    error,
    loadRooms,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
  } = useChatRooms({ token, user });

  useEffect(() => {
    loadRooms();
  }, [token, user?.id]);

  const currentRoom = rooms.find((room) => room._id === currentRoomId) || null;

  return (
    <div>
      <CreateChatRoomForm onCreate={handleCreateRoom} isLoading={isLoading} />
      {error ? <p>{error}</p> : null}
      <ChatRoomsList
        rooms={rooms}
        currentRoomId={currentRoomId}
        currentUserId={user?.id}
        onJoin={handleJoinRoom}
        onLeave={handleLeaveRoom}
        isLoading={isLoading}
      />
      <ChatRoomMessages socket={socket} token={token} user={user} room={currentRoom} />
    </div>
  );
}

export default ChatRoomManager;
