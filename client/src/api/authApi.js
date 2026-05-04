const API_BASE_URL = "http://localhost:5000/api/auth";

async function authRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Authentication failed.");
  }

  return data;
}

function registerUser(payload) {
  return authRequest("/register", payload);
}

function loginUser(payload) {
  return authRequest("/login", payload);
}

export { registerUser, loginUser };
