const socketAuth = require('../middlewares/socketAuth');
const ClassModel = require('../models/class.model');
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
            console.log("initClassUpdate", data);
            socket.join(data);
        })

        socket.on('classPostComment', async (data) => {
            try {
                const { classPostId, comment: commentData, classId } = data;

                const classPost = await ClassPost.findById(classPostId);
                if (!classPost) throw new Error('ClassPost not found');

                classPost.comments.push(commentData);

                await classPost.save();

                const populatedClassPost = await classPost.populate(
                    {
                        path: `comments.${classPost.comments.length - 1}.author`,
                        select: '_id name avatar_url'
                    }
                );

                const newComment = populatedClassPost.comments[classPost.comments.length - 1];
                console.log("new comment", newComment);
                console.log("classId", classId);
                this.io.to(classId).emit('classPostComment', newComment);
            } catch (error) {
                console.error('error creating new class post comment:', error);
            }
        });


        socket.on('classPostCreate', async (data) => {
            try {
                const newPost = await ClassPost.create({
                    ...data,
                });
                const classObj = await ClassModel.findById(data.classId);
                classObj.class_posts.push(newPost._id);
                await classObj.save();

                const populatedClassPost = await newPost.populate({
                    path: "author",
                    select: "_id name email avatar_url"
                })
                this.io.to(data.classId).emit('classPostCreate', populatedClassPost);
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