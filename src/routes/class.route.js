const express = require('express');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole');
const classController = require('../controllers/class.controller');
const assignmentController = require('../controllers/assignment.controller');

const router = express.Router();

router.use(auth)

router.post("/classes", authorizeRole(["manager"]), classController.createClass)
router.get("/classes", classController.getAllClasses)

router.get("/my-classes", authorizeRole(["teacher", "student"]), classController.getCurrentUserClasses)

router.get("/classes/:id", classController.getClassById)
router.patch("/classes/:id", authorizeRole(["manager"]), classController.updateClass)
router.delete("/classes/:id", authorizeRole(["manager"]), classController.deleteClass)

router.post("/classes/:id/add-teacher", authorizeRole(["manager", "teacher"]), classController.addTeacher)
router.delete("/classes/:id/remove-teacher", authorizeRole(["manager", "teacher"]), classController.removeTeacher)
router.post("/classes/:id/add-session", authorizeRole(["manager"]), classController.addSession)
router.post("/classes/:id/add-students", authorizeRole(["manager", "staff"]), classController.addStudent)
router.delete("/classes/:id/remove-student", authorizeRole(["manager", "staff"]), classController.removeStudent)
router.post("/classes/:id/join", authorizeRole(["teacher", "student"]), classController.joinClass)
router.delete("/classes/:id/leave", authorizeRole(["teacher", "student"]), classController.leaveClass)

router.post("/classes/:id/add-assignment", authorizeRole(["teacher"]), assignmentController.addAssignment)


module.exports = router;
