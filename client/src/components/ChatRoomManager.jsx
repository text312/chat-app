import { useEffect } from "react";
import CreateChatRoomForm from "./CreateChatRoomForm";
import ChatRoomsList from "./ChatRoomsList";
import ChatRoomMessages from "./ChatRoomMessages";
import useChatRooms from "../hooks/useChatRooms";

function ChatRoomManager({ token, user, onLogout }) {
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
    <div className="chat-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Rooms</h2>
          <button type="button" className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
        <p className="muted">Signed in as {user?.username || user?.email}</p>
        <CreateChatRoomForm onCreate={handleCreateRoom} isLoading={isLoading} />
        {error ? <p className="error-text">{error}</p> : null}
        <ChatRoomsList
          rooms={rooms}
          currentRoomId={currentRoomId}
          currentUserId={user?.id}
          onJoin={handleJoinRoom}
          onLeave={handleLeaveRoom}
          isLoading={isLoading}
        />
      </aside>
      <section className="chat-panel">
        <ChatRoomMessages
          socket={socket}
          token={token}
          user={user}
          room={currentRoom}
        />
      </section>
    </div>
  );
}

export default ChatRoomManager;
