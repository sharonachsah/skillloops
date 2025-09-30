// backend/src/scripts/backfillRoomsChallenge.js
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../db.js";
import Room from "../models/Room.js";
import Challenge from "../models/Challenge.js";
import mongoose from "mongoose";

async function pickRandomChallenge(filter = {}) {
  const count = await Challenge.countDocuments(filter);
  if (count === 0) return null;
  const rand = Math.floor(Math.random() * count);
  return await Challenge.findOne(filter).skip(rand).lean();
}

async function backfill() {
  await connectDB();
  console.log("Finding rooms without challengeId...");
  const rooms = await Room.find({ $or: [{ challengeId: { $exists: false } }, { challengeId: null }] }).limit(1000).lean();
  console.log("Rooms to update:", rooms.length);
  for (const r of rooms) {
    const ch = await pickRandomChallenge();
    if (!ch) {
      console.log("No challenge available to attach. Create seed data first.");
      break;
    }
    await Room.findByIdAndUpdate(r._id, { $set: { challengeId: ch._id } });
    console.log(`Attached challenge ${ch._id} to room ${r.code}`);
  }
  console.log("Backfill complete.");
  await mongoose.connection.close();
  process.exit(0);
}

backfill().catch(err => {
  console.error("Backfill failed", err);
  process.exit(1);
});
