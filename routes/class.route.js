const express = require('express')
const ClassModel = require('../models/class.model')
const auth = require('../middlewares/auth')
const getModelByRole = require('../controllers/roleController')
const checkRole = require('../middlewares/checkRole')

const router = express.Router()

router.post("/classes", auth, checkRole(["manager"]), async (req, res) => {
    const newClass = new ClassModel(req.body)
    try {
        await newClass.save()
        res.send(newClass)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get("/classes/:id", auth, async (req, res) => {
    try {
        const classdocs = await ClassModel.findOne({ _id: req.params.id })
        if (!classdocs) {
            return res.status(401).send({ error: "class not found" })
        }
        res.send(classdocs)
    } catch (e) {
        res.status(500).send(e)
    }
})



router.patch("/classes/:id", auth, checkRole(["manager"]), async (req, res) => {
    const updateFields = Object.keys(req.body)
    const alowedUpdateField = ['class_name', 'class_code', 'level', 'teacher_id', 'max_students', 'schedule', 'notes']
    const isValidOperation = updateFields.every((update) => alowedUpdateField.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update field" })
    }
    const classdocs = await ClassModel.findOne({ _id: req.params.id })
    try {
        updateFields.forEach((update) => classdocs[update] = req.body[update])
        await classdocs.save()
        res.send(classdocs)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router