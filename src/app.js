const express = require('express')
const InitiateMongoServer = require('./configs/db')
const routes = require('./routes')

require('dotenv').config()

const app = express()


const host = process.env.APP_HOST || "localhost"
const port = process.env.APP_PORT || 3000

InitiateMongoServer()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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