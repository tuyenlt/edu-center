const socketAuth = require('../middlewares/socketAuth');
const Chatroom = require('../models/chatroom.model');
const ClassModel = require('../models/class.model');
const ClassPost = require('../models/classPost.model');
const commentSchema = require('../models/comment.model');
const Message = require('../models/message.model');
const NotifyModel = require('../models/notify.model');
const User = require('../models/user.model');

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

				const chatroom = await Chatroom.findById(roomId);
				const receivers = chatroom.members.filter(user => user.toString() !== socket.user._id.toString());

				// if user is not online, we can send a notification if not already sent
				for (const userId of receivers) {
					if (userId.toString() !== socket.user._id.toString()) {
						const userSocket = this.sockets.find(s => s.user._id.toString() === userId.toString());
						if (!userSocket) {
							const notification = {
								title: `${socket.user.name} sent a message`,
								content: message,
								type: 'chat_message',
								link: `/chat/${roomId}`,
							};

							let notifyDoc = await NotifyModel.findOne({
								type: notification.type,
								link: notification.link,
								users: userId,
							});

							if (notifyDoc) {
								notifyDoc.updatedAt = new Date();
								await notifyDoc.save();
							} else {
								notifyDoc = await NotifyModel.create({
									...notification,
									users: [userId]
								});
								await User.findByIdAndUpdate(userId, {
									$push: {
										notifies: {
											notify: notifyDoc._id,
											is_seen: false
										}
									}
								});
							}
						}
					}
				}

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
	},
	sendUserNotification(userId, notification) {
		this.sockets.forEach(socket => {
			if (socket.user._id.toString() === userId.toString()) {
				socket.emit('notification', notification);
				console.log(`Sending notification to ${socket.user.name}:`, notification);
			}
		});
	}
}


module.exports = webSocketService;