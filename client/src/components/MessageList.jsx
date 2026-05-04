function formatTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageList({ messages, currentUserId }) {
  if (!messages.length) {
    return <p className="muted">No messages yet. Start the conversation.</p>;
  }

  return (
    <ul className="message-list">
      {messages.map((message) => {
        const senderId = message.user?._id || message.user;
        const isCurrentUser = senderId === currentUserId;

        return (
          <li
            key={message._id}
            className={isCurrentUser ? "message-item own-message" : "message-item"}
          >
            <div className="message-head">
              <strong>{isCurrentUser ? "You" : message.user?.username || "User"}</strong>
              <span>{formatTime(message.createdAt)}</span>
            </div>
            <p>{message.content}</p>
          </li>
        );
      })}
    </ul>
  );
}

export default MessageList;
