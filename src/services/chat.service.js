const socketAuth = require('../middlewares/socketAuth');
const Message = require('../models/message.model');

function registerSocket(io) {
    io.use(socketAuth);
    io.on('connection', (socket) => {

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`${socket.user.name} joined room ${roomId}`)
        })

        socket.on('chatMessage', async (data) => {
            const { roomId, message } = data
            console.log(`${socket.user.name} send message: ${message} `);
            try {
                const newMessage = new Message({
                    author: socket.user._id,
                    chat_id: roomId,
                    content: message
                });
                await newMessage.save()
                console.log(newMessage)
                io.to(roomId).emit('chatMessage', {
                    author: socket.user,
                    message: message,
                    createdAt: newMessage.createdAt
                })
            } catch (error) {
                console.error("error creating new message:", error);
            }


        })
    })
}


module.exports = registerSocket;