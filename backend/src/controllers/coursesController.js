// backend/controllers/coursesController.js
import Course from "../models/Course.js";
import Challenge from "../models/Challenge.js";
import LessonModel, { LessonSchema } from "../models/Lesson.js"; // LessonModel is optional standalone model

/**
 * Controller for courses
 * Exports: list, getById, create, update, remove, addLesson, removeLesson, addChallenge
 */

export async function listCourses(req, res) {
  try {
    const { q, tag, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];
    if (tag) filter.tags = tag;

    const skip = (Math.max(1, page) - 1) * limit;
    const courses = await Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
    return res.json(courses);
  } catch (err) {
    console.error("listCourses error", err);
    return res.status(500).json({ error: "Failed to list courses" });
  }
}

export async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course) return res.status(404).json({ error: "Course not found" });
    return res.json(course);
  } catch (err) {
    console.error("getCourseById error", err);
    return res.status(500).json({ error: "Failed to fetch course" });
  }
}

export async function createCourse(req, res) {
  try {
    const payload = req.body;
    // minimal validation
    if (!payload.title) return res.status(400).json({ error: "title is required" });

    // attach creator if auth present
    if (req.user && req.user.uid) payload.creatorUid = req.user.uid;

    // ensure lessons array uses safe fields
    if (Array.isArray(payload.lessons)) {
      payload.lessons = payload.lessons.map(l => ({
        title: l.title || "Untitled lesson",
        content: l.content || "",
        videoUrl: l.videoUrl || "",
        code: l.code || ""
      }));
    }

    const course = await Course.create(payload);
    return res.status(201).json(course);
  } catch (err) {
    console.error("createCourse error", err);
    return res.status(500).json({ error: "Failed to create course" });
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const course = await Course.findByIdAndUpdate(id, payload, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });
    return res.json(course);
  } catch (err) {
    console.error("updateCourse error", err);
    return res.status(500).json({ error: "Failed to update course" });
  }
}

export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteCourse error", err);
    return res.status(500).json({ error: "Failed to delete course" });
  }
}

/**
 * Add a lesson to a course.
 * Body: { title, content, videoUrl, code, createStandaloneLesson: boolean }
 * If createStandaloneLesson true => we create a Lesson document in lessons collection and push a lightweight ref into course.lessons
 */
export async function addLesson(req, res) {
  try {
    const { courseId } = req.params;
    const { title, content = "", videoUrl = "", code = "", createStandaloneLesson = false } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Optionally create standalone lesson doc
    let lessonRef = null;
    if (createStandaloneLesson) {
      const lessonDoc = await LessonModel.create({ title, content, videoUrl, code, createdBy: req.user?.uid });
      lessonRef = { lessonId: lessonDoc._id, title: lessonDoc.title, content: lessonDoc.content, videoUrl: lessonDoc.videoUrl, code: lessonDoc.code };
    } else {
      lessonRef = { title, content, videoUrl, code };
    }

    course.lessons = course.lessons || [];
    course.lessons.push(lessonRef);
    await course.save();
    return res.status(201).json(course);
  } catch (err) {
    console.error("addLesson error", err);
    return res.status(500).json({ error: "Failed to add lesson" });
  }
}

export async function removeLesson(req, res) {
  try {
    const { courseId, lessonId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Remove by _id if embedded lesson has _id, or by lessonId reference or by matching title
    course.lessons = (course.lessons || []).filter(l => {
      if (!l) return false;
      if (l._id && l._id.toString() === lessonId) return false;
      if (l.lessonId && l.lessonId.toString() === lessonId) return false;
      return true;
    });

    await course.save();
    return res.json(course);
  } catch (err) {
    console.error("removeLesson error", err);
    return res.status(500).json({ error: "Failed to remove lesson" });
  }
}

/**
 * Create a challenge (standalone). Optionally attach challenge id to course.challenges (will create array dynamically).
 * Body: { title, description, questionType, options, answerIndex, timeLimit, tags, attachToCourseId }
 */
export async function addChallenge(req, res) {
  try {
    const payload = req.body;
    if (!payload.title) return res.status(400).json({ error: "title required" });

    if (req.user && req.user.uid) payload.creatorUid = req.user.uid;
    const challenge = await Challenge.create({
      title: payload.title,
      description: payload.description || "",
      questionType: payload.questionType || "mcq",
      options: Array.isArray(payload.options) ? payload.options : [],
      answerIndex: typeof payload.answerIndex === "number" ? payload.answerIndex : null,
      timeLimit: payload.timeLimit || 30,
      tags: payload.tags || []
    });

    if (payload.attachToCourseId) {
      await Course.findByIdAndUpdate(payload.attachToCourseId, { $push: { challenges: challenge._id } }, { new: true });
    }

    return res.status(201).json(challenge);
  } catch (err) {
    console.error("addChallenge error", err);
    return res.status(500).json({ error: "Failed to create challenge" });
  }
}

export default {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  removeLesson,
  addChallenge
};
