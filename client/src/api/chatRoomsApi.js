const API_BASE_URL = "http://localhost:5000/api/chat-rooms";

async function request(path, method, token, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed.");
  }

  return response.json();
}

function fetchChatRooms(token) {
  return request("/", "GET", token);
}

function createChatRoom(token, name) {
  return request("/", "POST", token, { name });
}

function joinChatRoom(token, roomId) {
  return request(`/${roomId}/join`, "POST", token);
}

function leaveChatRoom(token, roomId) {
  return request(`/${roomId}/leave`, "POST", token);
}

export { fetchChatRooms, createChatRoom, joinChatRoom, leaveChatRoom };
