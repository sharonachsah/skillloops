// backend/src/models/Course.js
import mongoose from "mongoose";
import { LessonSchema } from "./Lesson.js";
const { Schema } = mongoose;

const CourseLessonSubSchema = new Schema({
  lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", default: null },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  code: { type: String, default: "" },
  createdBy: { type: String, default: null },
}, { timestamps: true });

const CourseSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  creatorUid: { type: String },
  tags: { type: [String], default: [] },
  lessons: { type: [CourseLessonSubSchema], default: [] },
  challenges: [{ type: Schema.Types.ObjectId, ref: "Challenge" }],
  published: { type: Boolean, default: true }
}, { timestamps: true });

/**
 * Text index on title + description only.
 * Index tags separately (normal index).
 */
CourseSchema.index({ title: "text", description: "text" });
CourseSchema.index({ tags: 1 });

const Course = mongoose.models?.Course || mongoose.model("Course", CourseSchema);
export default Course;
