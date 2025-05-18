const ClassPost = require('../models/classPost.model.js');



const classPostController = {
    getClassPosts: async (req, res) => {
        try {
            const classId = req.params.id;

            const classPosts = await ClassPost.find({ classId })
                .populate('authorId', 'name avatar_url')
                .populate('comments')
                .populate('assignment', '_id');

            res.status(200).json(classPosts);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching class posts', error });
        }
    },
    createClassPost: async (req, res) => {
        try {
            const { title, content, type, attachments, assignment } = req.body;
            const classId = req.params.id;
            const authorId = req.user._id;

            const classDocument = await ClassPost.findById(classId);
            if (!classDocument) {
                return res.status(404).json({ message: 'Class not found' });
            }

            if (!classDocument.teachers.includes(authorId)) {
                return res.status(403).json({ message: 'You are not authorized to create a class post' });
            }

            const classPost = new ClassPost({
                title,
                content,
                classId,
                authorId,
                type,
                attachments,
                assignment,
            });

            await classPost.save();

            res.status(201).json({ message: 'Class post created successfully', classPost });
        } catch (error) {
            res.status(500).json({ message: 'Error creating class post', error });
        }
    },
    updateClassPost: async (req, res) => {
        try {
            const classPostId = req.params.id;

            const allowedUpdateFields = ['title', 'content', 'attachments'];
            const updates = Object.keys(req.body).filter((key) => allowedUpdateFields.includes(key));

            const classPost = await ClassPost.findById(classPostId);

            if (!classPost) {
                return res.status(404).json({ message: 'Class post not found' });
            }

            // Check if the user is the author of the class post
            if (classPost.authorId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You are not authorized to update this class post' });
            }

            updates.forEach((update) => {
                classPost[update] = req.body[update];
            });

            await classPost.save();

            res.status(200).json({ message: 'Class post updated successfully', classPost });
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

