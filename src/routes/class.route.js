const express = require('express');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole');
const classController = require('../controllers/class.controller');
const assignmentController = require('../controllers/assignment.controller');

const router = express.Router();

router.post("/classes", auth, authorizeRole(["manager"]), classController.createClass)
router.get("/classes", auth, classController.getAllClasses)
router.get("/my-classes", auth, authorizeRole(['teacher', 'student']), classController.getCurrentUserClasses)
router.get("/classes/:id", auth, classController.getClassById)
router.patch("/classes/:id", auth, authorizeRole(["manager"]), classController.updateClass)
router.post("/classes/:id/add-session", auth, authorizeRole(["manager"]), classController.addSession)
router.post("/classes/:id/join", auth, authorizeRole(['teacher', 'student']), classController.joinClass)
router.delete("/classes/:id/leave", auth, authorizeRole(['teacher', 'student']), classController.leaveClass)
router.post("/classes/:id/add-student", auth, authorizeRole(['manager']), classController.addStudent)
router.post("/classes/:id/add-assignment", auth, authorizeRole(['teacher']), assignmentController.addAssignment)
router.delete("/classes/:id", auth, authorizeRole(["manager"]), classController.deleteClass)

module.exports = router;
