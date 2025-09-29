// backend/models/Lesson.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * LessonSchema can be embedded in Course documents.
 * We also export a standalone Lesson model for separate lesson documents.
 */
export const LessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  code: { type: String, default: "" },
  resources: { type: [String], default: [] },
  createdBy: { type: String, default: null }
}, { timestamps: true });

// Create/return model if not already created (prevents overwrite on hot reload)
const Lesson = mongoose.models?.Lesson || mongoose.model("Lesson", LessonSchema);

export default Lesson;
