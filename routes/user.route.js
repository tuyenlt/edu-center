const express = require('express')
const User = require('../models/user.model')
const auth = require('../middlewares/auth')
const getModelByRole = require('../controllers/roleController')

const router = express.Router()

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        if (!user) {
            res.status(404).send("Unable to login")
            return
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.fillter((token) => {
            return token !== req.token
        })

        await req.user.save()
        res.send('Logout succecss')

    } catch (e) {
        res.status(500).send(e)
    }
})

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        res.user.tokens = []
        await res.user.save()
        res.send('Logout success')
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch("/users", auth, async (req, res) => {
    const updateFields = Object.keys(req.body)
    const alowedUpdateField = ['name', 'email', 'password', 'profilePic']
    const isValidOperation = updateFields.every((update) => alowedUpdateField.includes(update))

    if (!isValidOperation) {
        res.status(400).send({ error: "Invalid update field" })
    }
    try {
        updateFields.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete("/users/me", auth, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id })
        res.send("delete success")
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post("/users", async (req, res) => {
    const BaseModel = getModelByRole(req.body.role)
    const user = new BaseModel(req.body)
    try {
        const token = await user.generateJWTAuthToken()
        await user.save()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})



router.get("/users/me", auth, (req, res) => {
    console.log(req.user)
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
