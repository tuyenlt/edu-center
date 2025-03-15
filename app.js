const express = require('express')
const InitiateMongoServer = require('./configs/db')
const dotenv = require('dotenv').config()
const User = require('./models/user')
const app = express()
const mongoose = require('mongoose')
const userRoutes = require('./routes/user')

const host = process.env.APP_HOST || "localhost"
const port = process.env.APP_PORT || 3000

InitiateMongoServer()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use("/", userRoutes)

app.get("/", (req, res) => {
    res.send(
        '<h1>EDU-CENTER API ENDPOINT</h1>'
    )
})



app.listen(port, () => {
    console.log(`Server is listening on port http://${host}:${port}`)
})