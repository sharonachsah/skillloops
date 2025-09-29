// backend/src/routes/challenges.js
import express from "express";
import Challenge from "../models/Challenge.js";
import Course from "../models/Course.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

// GET /api/v1/challenges
router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(challenges);
  } catch (err) {
    console.error("challenges/list error", err);
    res.status(500).json({ error: "Failed to list challenges" });
  }
});

// GET /api/v1/challenges/:id
router.get("/:id", async (req, res) => {
  try {
    const ch = await Challenge.findById(req.params.id).lean();
    if (!ch) return res.status(404).json({ error: "Not found" });
    res.json(ch);
  } catch (err) {
    console.error("challenges/get error", err);
    res.status(500).json({ error: "Failed to fetch challenge" });
  }
});

// POST /api/v1/challenges (authenticated)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.title) return res.status(400).json({ error: "title required" });

    payload.creatorUid = req.user.uid;
    const ch = await Challenge.create({
      title: payload.title,
      description: payload.description || "",
      questionType: payload.questionType || "mcq",
      options: Array.isArray(payload.options) ? payload.options : [],
      answerIndex: typeof payload.answerIndex === "number" ? payload.answerIndex : null,
      starterCode: payload.starterCode || "",
      tests: Array.isArray(payload.tests) ? payload.tests : [],
      timeLimit: payload.timeLimit || 30,
      tags: Array.isArray(payload.tags) ? payload.tags : []
    });

    // optionally attach to a course
    if (payload.attachToCourseId) {
      await Course.findByIdAndUpdate(payload.attachToCourseId, { $push: { challenges: ch._id } });
    }

    res.status(201).json(ch);
  } catch (err) {
    console.error("challenges/create error", err);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

export default router;