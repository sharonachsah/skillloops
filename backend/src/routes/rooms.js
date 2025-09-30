// backend/src/routes/rooms.js
import express from "express";
import Room from "../models/Room.js";
import Challenge from "../models/Challenge.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

/**
 * Helper: pick a random Challenge document matching optional filters.
 * If none found and allowFallback true, create & return a simple placeholder challenge.
 */
async function pickRandomChallenge({ tag, difficulty, allowFallback = true } = {}) {
  const filter = {};
  if (tag) filter.tags = tag;
  if (difficulty) filter.tags = { $in: [difficulty] }; // store difficulty as a tag in seed
  const count = await Challenge.countDocuments(filter);
  if (count === 0) {
    if (!allowFallback) return null;
    // create a small placeholder challenge
    const placeholder = await Challenge.create({
      title: "Welcome Challenge — Short MCQ",
      description: "This is a sample starter challenge automatically attached to the room.",
      questionType: "mcq",
      options: ["Option A", "Option B", "Option C", "Option D"],
      answerIndex: 0,
      timeLimit: 30,
      tags: ["placeholder"]
    });
    return placeholder;
  }
  // pick random skip
  const rand = Math.floor(Math.random() * count);
  const doc = await Challenge.findOne(filter).skip(rand).lean();
  return doc;
}

/**
 * POST /create
 * Body: { mode, challengeId (optional), tag (optional), difficulty (optional) }
 * If no challengeId provided, server picks random challenge (optionally filtered by tag/difficulty).
 */
router.post("/create", verifyFirebaseToken, async (req, res) => {
  try {
    const { mode, challengeId, tag, difficulty } = req.body;

    // If client supplied a challengeId, verify it exists; otherwise pick random
    let chosenChallengeId = null;
    if (challengeId) {
      const ch = await Challenge.findById(challengeId).lean();
      if (!ch) {
        return res.status(400).json({ error: "Provided challengeId not found" });
      }
      chosenChallengeId = ch._id;
    } else {
      const picked = await pickRandomChallenge({ tag, difficulty, allowFallback: true });
      if (!picked) {
        // should not happen because allowFallback true
        return res.status(500).json({ error: "No challenge available" });
      }
      chosenChallengeId = picked._id;
    }

    // create unique room code (simple)
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();

    const initialParticipant = { uid: req.user.uid, displayName: req.user.email || req.user.uid };
    const room = await Room.create({
      code,
      mode: mode || "1v1",
      participants: [initialParticipant],
      createdBy: req.user.uid,
      challengeId: chosenChallengeId,
      scoreboard: []
    });

    // return the created room (lean it to avoid mongoose overhead)
    const created = await Room.findById(room._id).lean();
    return res.status(201).json(created);
  } catch (err) {
    console.error("rooms/create error", err);
    return res.status(500).json({ error: "Failed to create room" });
  }
});

/** GET list for debug/admin */
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(rooms);
  } catch (err) {
    console.error("rooms/list error", err);
    res.status(500).json({ error: "Failed to list rooms" });
  }
});

/** GET by room code */
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

/** POST /:code/scoreboard - accept object or array; save normalized array */
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
