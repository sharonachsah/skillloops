// frontend/src/pages/Room.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { connectSocket, getSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

/** helpers */
function scoreboardToObject(sb) {
  if (!sb) return {};
  if (Array.isArray(sb)) {
    const obj = {};
    sb.forEach((e) => { if (e && e.name) obj[e.name] = Number(e.score || 0); });
    return obj;
  }
  if (typeof sb === "object") return sb;
  return {};
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, loading, getIdToken } = useAuth();

  const [room, setRoom] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [scoreboard, setScoreboard] = useState({});
  const [participantName, setParticipantName] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);

  // 1) Fetch room and challenge immediately (so UI shows challenge even before join)
  useEffect(() => {
    if (!roomId) return;
    let mounted = true;
    async function loadRoom() {
      try {
        const res = await API.get(`/rooms/${roomId}`);
        if (!mounted) return;
        setRoom(res.data);
        if (res.data && res.data.scoreboard) {
          setScoreboard(scoreboardToObject(res.data.scoreboard));
        }
        if (res.data && res.data.challengeId) {
          try {
            const chRes = await API.get(`/challenges/${res.data.challengeId}`);
            if (!mounted) return;
            setChallenge(chRes.data);
          } catch (err) {
            console.warn("Failed to load challenge", err);
          }
        }
      } catch (err) {
        setError("Room not found or server error");
        console.error("Failed fetch room:", err);
      }
    }
    loadRoom();
    return () => { mounted = false; };
  }, [roomId]);

  // set default participant name from auth
  useEffect(() => {
    if (user) setParticipantName(user.email || user.displayName || "guest");
  }, [user]);

  // Attach socket listeners helper
  function attachSocket(s) {
    if (!s) return;
    socketRef.current = s;
    s.on("connect", () => setSocketConnected(true));
    s.on("disconnect", () => setSocketConnected(false));
    s.on("scoreboard-update", (payload) => {
      setScoreboard(scoreboardToObject(payload));
    });
    s.on("user-joined", (payload) => {
      // optional: toast
      console.debug("user-joined", payload);
    });
    s.on("room-error", (payload) => {
      setError(payload?.message || "Room error from server");
      setJoining(false);
      alert(payload?.message || "Room error");
    });
    s.on("connect_error", (err) => {
      console.error("Socket connect_error:", err?.message || err);
      setError(err?.message || "Socket auth failed");
      setJoining(false);
    });
  }

  function detachSocket(s) {
    if (!s) return;
    s.off("connect");
    s.off("disconnect");
    s.off("scoreboard-update");
    s.off("user-joined");
    s.off("room-error");
    s.off("connect_error");
    socketRef.current = null;
  }

  // 2) Auto-join when (a) roomId present and (b) user is authenticated.
  // But if user is not authenticated: show challenge (read-only) and a prompt to login to join.
  useEffect(() => {
    let mounted = true;
    async function doJoin() {
      if (!roomId) return;
      // already joined?
      const sExisting = getSocket();
      if (sExisting && sExisting.connected && socketRef.current === sExisting) {
        // already connected
        return;
      }

      // Wait for auth to settle
      if (loading) return;
      if (!user) {
        // not signed in — we do not auto-join, show prompt
        setJoining(false);
        return;
      }

      setJoining(true);
      setError(null);

      try {
        const token = await getIdToken();
        if (!mounted) return;
        const s = connectSocket(token);
        attachSocket(s);

        // Emit join-room
        s.emit("join-room", { roomId, user: { uid: user.uid, name: participantName || user.email } });

        // Once we receive scoreboard-update (server will send it), we consider joined.
        // But we don't block — set joining false after short delay.
        const onScore = () => {
          setJoining(false);
        };
        s.once("scoreboard-update", onScore);
        // fallback clear join state after 2s
        setTimeout(() => setJoining(false), 2200);
      } catch (err) {
        console.error("Auto-join failed", err);
        setError(err?.message || "Failed to connect");
        setJoining(false);
      }
    }

    doJoin();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user, loading, participantName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const s = getSocket();
      if (s) {
        detachSocket(s);
        disconnectSocket();
      }
    };
  }, []);

  // Score submission handler (MCQ/coding/short-answer simplified)
  async function handleSubmit(answer) {
    if (!challenge) return;
    const name = participantName || user?.email || "guest";
    let correct = false;
    if (challenge.questionType === "mcq") {
      correct = Number(answer) === Number(challenge.answerIndex);
    } else if (challenge.questionType === "short-answer") {
      correct = typeof answer === "string" && answer.trim().length > 0;
    } else if (challenge.questionType === "coding") {
      // naive: accept any non-empty code as submission
      correct = typeof answer === "string" && answer.trim().length > 0;
    }

    if (correct) {
      const newScore = (scoreboard[name] || 0) + 10;
      const updated = { ...scoreboard, [name]: newScore };
      setScoreboard(updated);
      // emit via socket if connected, otherwise persist via REST
      const s = getSocket();
      if (s && s.connected) {
        s.emit("room-score-update", { roomId, scoreboard: updated });
      } else {
        try {
          await API.post(`/rooms/${roomId}/scoreboard`, { scoreboard: updated });
        } catch (err) {
          console.warn("Failed to persist scoreboard via REST", err);
        }
      }
      return { success: true, message: "Correct! +10 XP" };
    } else {
      return { success: false, message: "Incorrect" };
    }
  }

  // UI handlers
  function onMCQSelect(idx) {
    handleSubmit(idx).then(res => {
      if (res.success) alert(res.message);
      else alert(res.message);
    });
  }

  function onSubmitShort(inputEl) {
    const val = inputEl?.value || "";
    handleSubmit(val).then(res => alert(res.message));
  }

  function onSubmitCode(editorId) {
    const val = document.getElementById(editorId)?.value || "";
    handleSubmit(val).then(res => alert(res.message));
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Room {room?.code || roomId}</h2>
        <div className="text-sm text-gray-600">
          Socket: {socketConnected ? "Connected" : "Disconnected"} {joining && " · Joining…"}
        </div>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      {challenge ? (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{challenge.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

          {challenge.questionType === "mcq" && (
            <div className="space-y-2">
              {challenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => onMCQSelect(idx)}
                  className="block w-full text-left px-3 py-2 border rounded hover:bg-slate-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {challenge.questionType === "short-answer" && (
            <div>
              <input id="short-answer" className="w-full p-2 border rounded mb-2" placeholder="Type answer and press Submit" />
              <button onClick={() => onSubmitShort(document.getElementById("short-answer"))} className="px-4 py-2 bg-primary text-white rounded">
                Submit
              </button>
            </div>
          )}

          {challenge.questionType === "coding" && (
            <div>
              <textarea id="code-editor" defaultValue={challenge.starterCode || ""} className="w-full h-40 p-2 border rounded mb-2 font-mono" />
              <button onClick={() => onSubmitCode("code-editor")} className="px-4 py-2 bg-primary text-white rounded">Submit Code</button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 text-gray-600">No challenge attached to this room yet.</div>
      )}

      {!user && (
        <div className="mb-4 p-3 bg-yellow-50 border rounded">
          <strong>Sign in to join this room and submit answers.</strong>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Scoreboard</h3>
        <ul>
          {Object.keys(scoreboard).length === 0 ? (
            <li className="text-sm text-gray-500">No scores yet</li>
          ) : (
            Object.entries(scoreboard).map(([n, s]) => <li key={n} className="py-1">{n}: <strong>{s}</strong></li>)
          )}
        </ul>
      </div>
    </div>
  );
}
