const express = require('express')
const userRoutes = require('./user.route')
const studentRoutes = require('./student.route')
const classRoutes = require('./class.route')
const chatRoutes = require('./chat.route')
const courseRoutes = require('./course.route')

const router = express.Router()

router.use(userRoutes)
router.use(studentRoutes)
router.use(classRoutes)
router.use(chatRoutes)
router.use(courseRoutes)

module.exports = router