const express = require('express')
const StudentModel = require('../models/student.model')
const router = express.Router()
const auth = require("../middlewares/auth")
const authorizeRole = require('../middlewares/authorizeRole')
const studentController = require('../controllers/student.controller')

router.get("/students/:id/enrolled-classes", auth, studentController.getEnrolledClasses)
router.get("/students", auth, authorizeRole(["manager"]), studentController.getAllStudents)
router.get("/students/:id/schedules", auth, authorizeRole(["manager", "staff", "student"]), studentController.getStudentSchedules)


module.exports = router