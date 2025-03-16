const express = require('express')
const Student = require('../models/student.model')
const router = express.Router()
const auth = require("../middlewares/auth")
const checkRole = require('../middlewares/checkRole')

router.patch("/students/add-new-class", auth, checkRole(["student"]), async (req, res) => {
    try {
        await req.user.addNewClass(req.body.class_id)
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(500).send({ error: e.message })
    }
})

module.exports = router