// frontend/src/pages/Room.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connectSocket, getSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

/** helper: convert array of {name,score} -> object, or if already object return as-is */
function scoreboardToObject(sb) {
  if (!sb) return {};
  if (Array.isArray(sb)) {
    const obj = {};
    for (const e of sb) {
      if (e && e.name) obj[e.name] = e.score ?? 0;
    }
    return obj;
  }
  if (typeof sb === "object") return sb;
  return {};
}

export default function Room(){
  const { roomId } = useParams();
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(roomId || "");
  const [scoreboard, setScoreboard] = useState({}); // keep as object in UI
  const [participantName, setParticipantName] = useState(user?.email || "guest");

  useEffect(()=>{
    if (!user) return;
    connectSocket();
    const s = getSocket();
    s.on("connect", ()=> setConnected(true));
    s.on("disconnect", ()=> setConnected(false));
    s.on("user-joined", (payload)=> {
      // optional: show notification
    });
    s.on("scoreboard-update", (board) => {
      setScoreboard(prev => {
        // board may be array or object
        const obj = scoreboardToObject(board);
        return { ...prev, ...obj };
      });
    });
    return ()=> {
      disconnectSocket();
    }
  }, [user]);

  // fetch room by code (optional)
  useEffect(()=>{
    if (!roomId) return;
    API.get(`/rooms/${roomId}`).then(res=>{
      const room = res.data;
      if (room && room.scoreboard) {
        setScoreboard(scoreboardToObject(room.scoreboard));
      }
    }).catch(()=>{});
  }, [roomId]);

  async function createRoom(){
    try{
      const res = await API.post("/rooms/create", { mode: "1v1", challengeId: null });
      setRoomCode(res.data.code);
      const s = getSocket();
      s.emit("join-room", { roomId: res.data.code, user: { uid: user?.uid, name: participantName } });
    } catch (err) {
      alert("create failed");
    }
  }

  function joinRoom(){
    const s = getSocket();
    s.emit("join-room", { roomId: roomCode, user: { uid: user?.uid, name: participantName } });
  }

  function fakeScoreUpdate(){
    // update local scoreboard object and emit
    setScoreboard(prev => {
      const newScore = (prev[participantName] || 0) + 10;
      const newBoard = { ...prev, [participantName]: newScore };
      // emit as object (server will broadcast to room)
      const s = getSocket();
      s.emit("room-score-update", { roomId: roomCode, scoreboard: newBoard });
      return newBoard;
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Challenge Room</h2>
      <div className="flex gap-2 mb-3">
        <input className="flex-1 p-2 border rounded" placeholder="Room code" value={roomCode} onChange={e=>setRoomCode(e.target.value)} />
        <button onClick={joinRoom} className="px-3 py-2 border rounded">Join</button>
        <button onClick={createRoom} className="px-3 py-2 bg-primary text-white rounded">Create</button>
      </div>
      <div className="mb-3">
        <input className="p-2 border rounded" value={participantName} onChange={e=>setParticipantName(e.target.value)} />
      </div>

      <div className="mb-3">
        <button onClick={fakeScoreUpdate} className="px-3 py-2 bg-primary text-white rounded">+10 points (fake)</button>
      </div>

      <div>
        <h3 className="font-medium">Scoreboard</h3>
        <ul>
          {Object.entries(scoreboard ?? {}).map(([name, pts])=>(
            <li key={name} className="py-1">{name}: {pts}</li>
          ))}
        </ul>
      </div>
      <div className="mt-2 text-sm text-gray-500">Socket status: {connected ? 'Connected' : 'Disconnected'}</div>
    </div>
  );
}
