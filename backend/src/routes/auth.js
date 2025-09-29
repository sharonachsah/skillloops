// backend/src/routes/auth.js
import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import User from "../models/User.js";

const router = express.Router();

// POST /api/v1/auth/sync  - upsert user after client logs in
router.post("/sync", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const updated = await User.findOneAndUpdate(
      { uid },
      { uid, email, $setOnInsert: { xp: 0, roles: ["learner"] } },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("auth/sync error", err);
    res.status(500).json({ error: "server error" });
  }
});

// GET /api/v1/auth/me - returns user doc for current user
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// POST /api/v1/auth/profile - update profile fields (avatar, skills, xp)
router.post("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const payload = {};
    if (req.body.avatar !== undefined) payload.avatar = req.body.avatar;
    if (Array.isArray(req.body.skills)) payload.skills = req.body.skills;
    if (typeof req.body.xp === "number") payload.xp = req.body.xp;
    const user = await User.findOneAndUpdate({ uid }, { $set: payload }, { new: true, upsert: true });
    res.json(user);
  } catch (err) {
    console.error("auth/profile error", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
