import { useState } from "react";

function CreateChatRoomForm({ onCreate, isLoading }) {
  const [roomName, setRoomName] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!roomName.trim()) {
      return;
    }

    await onCreate(roomName.trim());
    setRoomName("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Chat Room</h3>
      <input
        type="text"
        value={roomName}
        onChange={(event) => setRoomName(event.target.value)}
        placeholder="Enter room name"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !roomName.trim()}>
        {isLoading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

export default CreateChatRoomForm;
