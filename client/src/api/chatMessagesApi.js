const API_BASE_URL = "http://localhost:5000/api/chat-messages";

async function fetchRoomMessages(token, roomId) {
  const response = await fetch(`${API_BASE_URL}/${roomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch messages.");
  }

  return response.json();
}

export { fetchRoomMessages };
