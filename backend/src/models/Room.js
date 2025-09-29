// backend/src/models/Room.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Room model
 * scoreboard is stored as an array of { name, score } to avoid Map key restrictions ('.' not allowed).
 */
const ScoreEntrySchema = new Schema({
  name: { type: String, required: true },
  score: { type: Number, default: 0 }
}, { _id: false });

const RoomSchema = new Schema({
  code: { type: String, unique: true, required: true },
  mode: { type: String, default: "1v1" },
  participants: [{ uid: String, displayName: String }],
  // store as array of score entries
  scoreboard: { type: [ScoreEntrySchema], default: [] },
  createdBy: String,
  challengeId: { type: Schema.Types.ObjectId, ref: "Challenge", default: null },
  expiresAt: Date
}, { timestamps: true });

const Room = mongoose.models?.Room || mongoose.model("Room", RoomSchema);
export default Room;
