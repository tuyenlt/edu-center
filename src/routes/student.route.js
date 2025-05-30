const express = require('express')
const router = express.Router()
const auth = require("../middlewares/auth")
const authorizeRole = require('../middlewares/authorizeRole')
const studentController = require('../controllers/student.controller')

router.get("/students/:id/enrolled-classes", auth, studentController.getEnrolledClasses)
router.get("/students", auth, authorizeRole(["manager"]), studentController.getAllStudents)
router.get("/students/:id/schedules", auth, authorizeRole(["manager", "staff", "student"]), studentController.getStudentSchedules)
router.get("/students/:id/requested-courses", auth, studentController.getStudentRequestedCourses)


module.exports = router