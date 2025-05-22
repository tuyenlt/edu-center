const socketAuth = require('../middlewares/socketAuth');
const ClassPost = require('../models/classPost.model');
const commentSchema = require('../models/comment.model');
const Message = require('../models/message.model');

const webSocketService = {
    io: null,
    sockets: [],
    register(io) {
        this.io = io;
        io.use(socketAuth);
        io.on('connection', (socket) => {
            this.sockets.push(socket);
            console.log('New client connected');

            this.chatRegister(socket);
            this.classPostRegister(socket);
            socket.on('disconnect', () => {
                console.log('Client disconnected');
                this.sockets = this.sockets.filter(s => s !== socket);
            });

        });
    },
    chatRegister(socket) {
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
                this.io.to(roomId).emit('chatMessage', {
                    author: socket.user,
                    message: message,
                    createdAt: newMessage.createdAt
                })
            } catch (error) {
                console.error("error creating new message:", error);
            }
        })
    },
    classPostRegister(socket) {
        socket.on('initClassUpdate', async (data) => {
            socket.join(data.classId);
        })

        socket.on('classPostComment', async (data) => {
            try {
                const classPost = await ClassPost.findById(data.classPostId);
                classPost.comments.push({
                    data: data.comment,
                });
                await classPost.save();
                this.io.to(data.classId).emit('classPostComment', data.comment);
            } catch (error) {
                console.error("error creating new class post comment:", error);
            }
        })

        socket.on('classPostCreate', async (data) => {
            try {
                const newPost = await ClassPost.create({
                    ...data,
                });
                this.io.to(data.classId).emit('classPostCreate', newPost);
            } catch (error) {
                console.error("error creating new class post:", error);
            }
        })
    },
    sendUserNotification(userId, notification) {
        this.sockets.forEach(socket => {
            if (socket.user._id.toString() === userId.toString()) {
                socket.emit('notification', notification);
            }
            console.log(`Sending notification to ${socket.user.name}:`, notification);
        });
    }
}


module.exports = webSocketService;