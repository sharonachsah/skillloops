// backend/src/models/Challenge.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const ChallengeSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  questionType: { type: String, enum: ["mcq", "coding", "short-answer"], default: "mcq" },
  options: { type: [String], default: [] },
  answerIndex: { type: Number, default: null },
  starterCode: { type: String, default: "" },
  tests: { type: [String], default: [] },
  timeLimit: { type: Number, default: 30 },
  creatorUid: { type: String },
  tags: { type: [String], default: [] },
}, { timestamps: true });

/**
 * Text index on title + description only (tags are an array -> not part of text index)
 * Separate index on tags (non-text) for fast filtering.
 */
ChallengeSchema.index({ title: "text", description: "text" });
ChallengeSchema.index({ tags: 1 });

const Challenge = mongoose.models?.Challenge || mongoose.model("Challenge", ChallengeSchema);
export default Challenge;
