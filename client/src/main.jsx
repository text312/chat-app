import React from "react";
import { createRoot } from "react-dom/client";
import ChatRoomManager from "./components/ChatRoomManager";

const storedToken = localStorage.getItem("chatToken") || "";
const storedUser = JSON.parse(localStorage.getItem("chatUser") || "null") || {
  id: "",
  username: "",
  email: "",
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatRoomManager token={storedToken} user={storedUser} />
  </React.StrictMode>
);
