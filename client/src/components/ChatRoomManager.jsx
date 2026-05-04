import { useEffect } from "react";
import CreateChatRoomForm from "./CreateChatRoomForm";
import ChatRoomsList from "./ChatRoomsList";
import useChatRooms from "../hooks/useChatRooms";

function ChatRoomManager({ token, user }) {
  const {
    rooms,
    currentRoomId,
    isLoading,
    error,
    loadRooms,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
  } = useChatRooms({ token, user });

  useEffect(() => {
    loadRooms();
  }, []);

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
    </div>
  );
}

export default ChatRoomManager;
