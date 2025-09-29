// backend/server.js
import http from "http";
import app from "./src/app.js";
import { Server } from "socket.io";
import dotenv from "dotenv";
import Room from "./src/models/Room.js";
dotenv.config();

const port = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }
});

function normalizeScoreboard(payload) {
  // payload can be object {name:score} or array [{name,score}]
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.map(e => ({ name: e.name, score: Number(e.score || 0) }));
  }
  if (typeof payload === "object") {
    return Object.entries(payload).map(([name, score]) => ({ name, score: Number(score || 0) }));
  }
  return [];
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join-room", ({roomId, user}) => {
    if (!roomId) return;
    socket.join(roomId);
    io.to(roomId).emit("user-joined", { user });
  });

  socket.on("room-score-update", async ({roomId, scoreboard}) => {
    if (!roomId) return;
    // Normalize and broadcast
    const normalized = normalizeScoreboard(scoreboard);
    io.to(roomId).emit("scoreboard-update", normalized);

    // Persist to DB (best-effort)
    try {
      await Room.findOneAndUpdate({ code: roomId }, { $set: { scoreboard: normalized } }, { new: true });
    } catch (err) {
      console.error("Failed to persist scoreboard for room", roomId, err.message);
    }
  });

  socket.on("disconnect", ()=> {
    // handle if needed
  });
});

server.listen(port, ()=> console.log(`Server running on ${port}`));
export { io };
