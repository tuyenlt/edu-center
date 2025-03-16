const express = require('express')
const userRoutes = require('./user.route')
const studentRoutes = require('./student.route')
const classRoutes = require('./class.route')


const router = express.Router()

router.use(userRoutes)
router.use(studentRoutes)
router.use(classRoutes)

module.exports = router