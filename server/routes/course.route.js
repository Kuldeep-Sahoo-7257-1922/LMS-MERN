import express from "express";
import {
  createCourse,
  createLecture,
  editCourse,
  editLecture,
  getCourseById,
  getCourseLectures,
  getCreatorCourses,
  getLectureById,
  getPublishedCourse,
  removeCourse,
  removeLecture,
  searchCourse,
  togglePublishCourse,
} from "../controllers/course.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createCourse);
router.route("/remove-course").delete(isAuthenticated, removeCourse);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get( getPublishedCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);

router
  .route("/:courseId")
  .put(isAuthenticated, upload.single("courseThumbnail"), editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLectures);
router.route("/:courseId/lecture/:lectureId").put(isAuthenticated, editLecture);

router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

export default router;
