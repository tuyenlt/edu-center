const ClassModel = require('../models/class.model.js');
const ClassPost = require('../models/classPost.model.js');
const NotifyModel = require('../models/notify.model.js');
const User = require('../models/user.model.js');
const webSocketService = require('../services/webSocket.service.js');



const classPostController = {
	getClassPosts: async (req, res) => {
		try {
			const classId = req.params.id;

			const classPosts = await ClassPost.find({ classId })
				.populate('authorId', 'name avatar_url')
				.populate({
					path: 'comments',
					populate: {
						path: 'authorId',
						select: 'name avatar_url'
					}
				})
				.populate('assignment', '_id title')
				.sort({ createdAt: -1 })

			res.status(200).json(classPosts);
		} catch (error) {
			res.status(500).json({ message: 'Error fetching class posts', error });
		}
	},
	createClassPost: async (req, res) => {
		try {
			const { classId, title, content, type, attachments, links } = req.body; // shit change
			const author = await User.findById(req.user._id);
			console.log(req.body)

			const classDocument = await ClassModel.findById(classId);
			if (!classDocument) {
				return res.status(404).json({ message: 'Class not found' });
			}

			if (!classDocument.teachers.includes(author._id)) {
				return res.status(403).json({ message: 'You are not authorized to create a class post' });
			}

			const classPost = new ClassPost({
				classId,
				title,
				content,
				author: author._id,
				type,
				attachments,
				links
			});

			const notification = await NotifyModel.create({
				title: `New class post in ${classDocument.class_name}`,
				content: `${author.name} has created a new post: ${title}`,
				type: 'class_post',
				link: `/class/${classId}`,
				users: classDocument.students
			});

			classDocument.class_posts.push(classPost._id);


			webSocketService.io.to(classId).emit('classPostCreate', classPost); // Emit the new class post to the class room
			await classDocument.save();
			await classPost.save();
			res.status(201).json(classPost);
		} catch (error) {
			res.status(500).json({ message: 'Error creating class post', error });
		}
	},
	updateClassPost: async (req, res) => {
		try {
			const classPostId = req.params.id;

			const allowedUpdateFields = ['title', 'content'];
			const updates = Object.keys(req.body).filter((key) => allowedUpdateFields.includes(key));

			const classPost = await ClassPost.findById(classPostId);

			if (!classPost) {
				return res.status(404).json({ message: 'Class post not found' });
			}

			// Check if the user is the author of the class post
			if (classPost.author.toString() !== req.user._id.toString()) {
				return res.status(403).json({ message: 'You are not authorized to update this class post' });
			}

			updates.forEach((update) => {
				classPost[update] = req.body[update];
			});

			await classPost.save();

			res.status(200).json(classPost);
		} catch (error) {
			res.status(500).json({ message: 'Error updating class post', error });
		}
	},
	deleteClassPost: async (req, res) => {
		try {
			const classPostId = req.params.id;

			const classPost = await ClassPost.findById(classPostId);

			if (!classPost) {
				return res.status(404).json({ message: 'Class post not found' });
			}

			// Check if the user is the author of the class post
			if (classPost.authorId.toString() !== req.user._id.toString()) {
				return res.status(403).json({ message: 'You are not authorized to delete this class post' });
			}

			await classPost.deleteOne();

			res.status(200).json({ message: 'Class post deleted successfully' });
		} catch (error) {
			res.status(500).json({ message: 'Error deleting class post', error });
		}
	},

	addComment: async (req, res) => {
		try {
			const { content } = req.body;
			const classPostId = req.params.id;
			const authorId = req.user._id;

			const classPost = await ClassPost.findById(classPostId);

			if (!classPost) {
				return res.status(404).json({ message: 'Class post not found' });
			}

			// Check if the user is a member of the class
			const classDocument = await ClassPost.findById(classPost.classId);
			if (!classDocument) {
				return res.status(404).json({ message: 'Class not found' });
			}
			if (!classDocument.students.includes(authorId) && !classDocument.teachers.includes(authorId)) {
				return res.status(403).json({ message: 'You are not authorized to comment on this class post' });
			}


			const comment = {
				content,
				postId: classPostId,
				authorId,
			};

			classPost.comments.push(comment);
			await classPost.save();

			res.status(201).json({ message: 'Comment added successfully', comment });
		} catch (error) {
			res.status(500).json({ message: 'Error adding comment', error });
		}
	}



}

module.exports = classPostController;

