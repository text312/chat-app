import React from "react";
import { createRoot } from "react-dom/client";
import ChatRoomManager from "./components/ChatRoomManager";

const demoUser = { id: "", username: "", email: "" };
const jwtToken = "";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatRoomManager token={jwtToken} user={demoUser} />
  </React.StrictMode>
);
