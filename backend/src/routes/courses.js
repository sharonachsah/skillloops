import express from "express";
import * as coursesCtrl from "../controllers/coursesController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.get("/", coursesCtrl.listCourses);
router.get("/:id", coursesCtrl.getCourseById);
router.post("/", verifyFirebaseToken, coursesCtrl.createCourse);
router.put("/:id", verifyFirebaseToken, coursesCtrl.updateCourse);
router.delete("/:id", verifyFirebaseToken, coursesCtrl.deleteCourse);

router.post("/:courseId/lessons", verifyFirebaseToken, coursesCtrl.addLesson);
router.delete("/:courseId/lessons/:lessonId", verifyFirebaseToken, coursesCtrl.removeLesson);

router.post("/:courseId/challenges", verifyFirebaseToken, async (req,res) => {
  // wrapper to attach challenge to a course
  req.body.attachToCourseId = req.params.courseId;
  return coursesCtrl.addChallenge(req,res);
});

export default router;
