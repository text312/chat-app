import { useState } from "react";
import AuthForm from "./components/AuthForm";
import ChatRoomManager from "./components/ChatRoomManager";
import "./styles.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("chatToken") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("chatUser") || "null") || null
  );

  function handleAuthSuccess({ token: nextToken, user: nextUser }) {
    localStorage.setItem("chatToken", nextToken);
    localStorage.setItem("chatUser", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function handleLogout() {
    localStorage.removeItem("chatToken");
    localStorage.removeItem("chatUser");
    setToken("");
    setUser(null);
  }

  return (
    <main className="app-shell">
      {!token || !user ? (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      ) : (
        <ChatRoomManager token={token} user={user} onLogout={handleLogout} />
      )}
    </main>
  );
}

export default App;
