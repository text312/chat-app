import { useState } from "react";

function MessageForm({ onSend, isSending, disabled }) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    await onSend(message);
    setMessage("");
  }

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type a message..."
        disabled={disabled || isSending}
      />
      <button type="submit" disabled={disabled || isSending || !message.trim()}>
        {isSending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

export default MessageForm;
