// backend/src/routes/rooms.js
import express from "express";
import Room from "../models/Room.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.post("/create", verifyFirebaseToken, async (req,res)=>{
  try {
    const { mode, challengeId } = req.body;
    const code = Math.random().toString(36).slice(2,8).toUpperCase();
    const initialParticipant = { uid: req.user.uid, displayName: req.user.email };
    const room = await Room.create({
      code,
      mode,
      participants: [initialParticipant],
      createdBy: req.user.uid,
      challengeId,
      scoreboard: []
    });
    res.json(room);
  } catch (err) {
    console.error("rooms/create error", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// GET by room code
router.get("/:code", async (req,res)=>{
  try {
    const room = await Room.findOne({ code: req.params.code }).lean();
    if (!room) return res.status(404).json({error:"not found"});
    res.json(room);
  } catch (err) {
    console.error("rooms/get error", err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// POST /:code/scoreboard - accept object or array; save normalized array
router.post("/:code/scoreboard", verifyFirebaseToken, async (req,res)=>{
  try {
    const { code } = req.params;
    const payload = req.body.scoreboard;
    let normalized = [];
    if (Array.isArray(payload)) {
      normalized = payload.map(e => ({ name: e.name, score: Number(e.score || 0) }));
    } else if (payload && typeof payload === "object") {
      normalized = Object.entries(payload).map(([name, score]) => ({ name, score: Number(score||0) }));
    } else {
      return res.status(400).json({ error: "Invalid scoreboard" });
    }
    const room = await Room.findOneAndUpdate({ code }, { $set: { scoreboard: normalized } }, { new: true });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("rooms/scoreboard error", err);
    res.status(500).json({ error: "Failed to save scoreboard" });
  }
});

export default router;
