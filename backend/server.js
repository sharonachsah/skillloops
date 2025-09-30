// backend/server.js
import http from "http";
import app from "./src/app.js";
import { Server } from "socket.io";
import dotenv from "dotenv";
import admin from "firebase-admin";
import Room from "./src/models/Room.js";
dotenv.config();

// initialize firebase admin if not already (also used by verifyFirebaseToken middleware)
if (!admin.apps.length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!svcJson) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not set — token verification will fail.");
  } else {
    try {
      const parsed = typeof svcJson === "string" ? JSON.parse(svcJson) : svcJson;
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
    }
  }
}

const port = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" },
  // allow cookie if needed, etc.
});

function normalizeScoreboard(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.map(e => ({ name: e.name, score: Number(e.score || 0) }));
  }
  if (typeof payload === "object") {
    return Object.entries(payload).map(([name, score]) => ({ name, score: Number(score || 0) }));
  }
  return [];
}

// Middleware-like authentication on socket handshake using Firebase token
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication token missing"));
    }
    // verify with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);
    // attach user to socket for later handlers
    socket.user = { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email };
    return next();
  } catch (err) {
    console.error("Socket auth failed:", err.message);
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id} (uid=${socket.user?.uid})`);

  // join-room: { roomId (code), user: { uid, name } }
  socket.on("join-room", async ({ roomId, user }) => {
    try {
      if (!roomId) return;
      // add socket to room
      socket.join(roomId);

      // read Room doc; if not exists -> respond with an error event
      let room = await Room.findOne({ code: roomId });
      if (!room) {
        // optionally create a room record if you want (here we reject)
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      // ensure participant exists in DB participants
      const participantUid = socket.user?.uid || (user && user.uid) || null;
      const participantName = (user && (user.name || user.displayName)) || socket.user?.email || "guest";

      // if participant not present, push into participants array
      const exists = room.participants?.some(p => p.uid === participantUid || p.displayName === participantName);
      if (!exists) {
        room.participants.push({ uid: participantUid, displayName: participantName });
        await room.save();
      }

      // send the current scoreboard (normalize to array) to the newly joined socket
      const sb = room.scoreboard || [];
      socket.emit("scoreboard-update", sb);

      // notify others in room that someone joined; send the joined user's info
      io.to(roomId).emit("user-joined", { uid: participantUid, displayName: participantName, roomCode: roomId });

      console.log(`User ${participantName} joined room ${roomId}`);
    } catch (err) {
      console.error("join-room error:", err);
      socket.emit("room-error", { message: "Failed to join room" });
    }
  });

  // room-score-update: { roomId, scoreboard } where scoreboard can be object or array
  socket.on("room-score-update", async ({ roomId, scoreboard }) => {
    try {
      if (!roomId) return;
      const normalized = normalizeScoreboard(scoreboard);

      // Broadcast normalized array to room
      io.to(roomId).emit("scoreboard-update", normalized);

      // Persist to DB (best-effort)
      try {
        await Room.findOneAndUpdate({ code: roomId }, { $set: { scoreboard: normalized } }, { new: true });
      } catch (err) {
        console.error("Failed to persist scoreboard:", err.message);
      }
    } catch (err) {
      console.error("room-score-update handler error:", err);
    }
  });

  socket.on("leave-room", async ({ roomId }) => {
    try {
      socket.leave(roomId);
      // Optionally remove participant from DB (skip for now)
    } catch (err) {
      console.error("leave-room error:", err);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id} reason=${reason}`);
  });
});

server.listen(port, () => console.log(`Server running on ${port}`));

export { io };
