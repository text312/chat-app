import MessageForm from "./MessageForm";
import MessageList from "./MessageList";
import useRoomMessages from "../hooks/useRoomMessages";

function ChatRoomMessages({ socket, token, user, room }) {
  const roomId = room?._id || null;
  const { messages, isSending, error, sendMessage } = useRoomMessages({
    socket,
    token,
    user,
    roomId,
  });

  if (!roomId) {
    return (
      <div className="message-empty-state">
        <p>Select or join a chat room to start messaging.</p>
      </div>
    );
  }

  return (
    <section className="messages-section">
      <h3>Room: {room.name}</h3>
      {error ? <p>{error}</p> : null}
      <MessageList messages={messages} currentUserId={user?.id} />
      <MessageForm onSend={sendMessage} isSending={isSending} disabled={!roomId} />
    </section>
  );
}

export default ChatRoomMessages;
