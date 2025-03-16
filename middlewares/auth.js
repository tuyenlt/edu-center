const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()
const ObjectId = require('mongoose').Types.ObjectId;

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: new ObjectId(decoded._id), 'tokens.token': token })

        if (!user) {
            console.log({ _id: decoded.id, 'tokens.token': token })
            throw new Error("User not found")
        }

        req.token = token
        req.user = user

        next()

    } catch (e) {
        console.log(e)
        res.status(401).send('Authentication error!')
    }
}

module.exports = auth