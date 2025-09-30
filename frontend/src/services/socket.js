// frontend/src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

export function connectSocket(token, opts = {}) {
  // If socket exists and token unchanged, return it
  if (socket) {
    try {
      const currentToken = socket.auth?.token;
      if (currentToken && token && currentToken === token && socket.connected) {
        return socket;
      }
    } catch (e) {
      // ignore
    }
    // token changed or socket not connected => disconnect then reconnect
    disconnectSocket();
  }

  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
  socket = io(url, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
    ...opts,
  });

  socket.on("connect", () => {
    console.debug("[socket] connected", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.debug("[socket] disconnected", reason);
  });

  socket.on("connect_error", (err) => {
    // helpful log for handshake/token issues
    console.error("[socket] connect_error:", err && err.message ? err.message : err);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.removeAllListeners();
    socket.disconnect();
  } catch (e) {
    // ignore
  } finally {
    socket = null;
  }
}
