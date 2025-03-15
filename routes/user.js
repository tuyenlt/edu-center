const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth')

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
        res.status(500).send(e)
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

router.post("/users", async (req, res) => {
    const user = new User(req.body)
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
