// frontend/src/services/socket.js
import { io } from "socket.io-client";

let socket;

export function connectSocket(token, opts={}) {
  if (socket) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
  socket = io(url, {
    auth: { token },
    transports: ["websocket"],
    ...opts,
  });
  return socket;
}

export function getSocket(){
  return socket;
}

export function disconnectSocket(){
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
