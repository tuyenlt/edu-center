const express = require('express')
const InitiateMongoServer = require('./configs/db')
const cors = require('cors')
const cookieParser = require("cookie-parser");
require('dotenv').config()
const routes = require('./routes')

const app = express()


const host = process.env.APP_HOST || "localhost"
const port = process.env.APP_PORT || 3000

InitiateMongoServer()

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // Allow cookies & authentication headers
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

app.use(routes)

app.get("/", (req, res) => {
    res.send(
        '<h1>EDU-CENTER API ENDPOINT</h1>'
    )
})



app.listen(port, () => {
    console.log(`Server is listening on port http://${host}:${port}`)
})