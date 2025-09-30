// frontend/src/pages/RoomsList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function RoomsList(){
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(()=> {
    let mounted = true;
    async function load() {
      try {
        // GET /api/v1/rooms (backend should implement this route)
        const res = await API.get("/rooms");
        if (!mounted) return;
        setRooms(res.data || []);
      } catch (err) {
        console.warn("Could not load rooms list", err?.message);
        setRooms([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return ()=> mounted = false;
  }, []);

  async function createRoom() {
    if (!user) {
      alert("Please sign in to create a room.");
      return;
    }
    try {
      const res = await API.post("/rooms/create", { mode: "1v1", challengeId: null });
      const code = res.data.code;
      nav(`/room/${code}`);
    } catch (err) {
      console.error("createRoom failed", err);
      alert("Failed to create room");
    }
  }

  function join(code) {
    setJoining(code);
    nav(`/room/${code}`);
    // clear join button state after navigation
    setTimeout(()=> setJoining(null), 1500);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Challenge Rooms</h1>
        <div>
          <button onClick={createRoom} className="px-4 py-2 bg-primary text-white rounded">Create room</button>
        </div>
      </div>

      {loading ? (
        <div>Loading rooms...</div>
      ) : (
        <>
          {rooms.length === 0 ? (
            <div className="p-6 bg-white rounded shadow">
              <p className="text-gray-600">No public rooms found. Create a new room to get started.</p>
              <div className="mt-3">
                <button onClick={createRoom} className="px-4 py-2 bg-primary text-white rounded">Create first room</button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {rooms.map((r) => (
                <div key={r._id || r.code} className="p-4 bg-white rounded shadow flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.code}</div>
                    <div className="text-sm text-gray-500">{r.mode} — created by {r.createdBy || "unknown"}</div>
                    <div className="text-sm text-gray-500">Challenge: {r.challengeId ? r.challengeId : "—"}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => join(r.code)}
                      className="px-3 py-2 border rounded"
                      disabled={joining === r.code}
                    >
                      {joining === r.code ? "Joining…" : "Join"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
