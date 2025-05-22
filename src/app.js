const express = require('express')
const InitiateMongoServer = require('./configs/db')
const cookieParser = require("cookie-parser");
require('dotenv').config()
const routes = require('./routes')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')
const { apiCors, socketCors } = require('./configs/corsConfig')
const webSocketService = require('./services/webSocket.service')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: socketCors })

const host = process.env.APP_HOST || "localhost"
const port = process.env.APP_PORT || 3000
webSocketService.register(io)
InitiateMongoServer()

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

app.use(apiCors);


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

app.use(routes)

app.get("/", (req, res) => {
    res.send(
        '<h1>EDU-CENTER API ENDPOINT</h1>'
    )
})


server.listen(port, '0.0.0.0', () => {
    console.log(`Server is listening on http://${host}:${port}`);
});