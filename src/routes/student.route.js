const express = require('express')
const StudentModel = require('../models/student.model')
const router = express.Router()
const auth = require("../middlewares/auth")
const authorizeRole = require('../middlewares/authorizeRole')
const studentController = require('../controllers/student.controller')

router.get("/students/:id/enrolled-classes", auth, studentController.getEnrolledClasses)

module.exports = router