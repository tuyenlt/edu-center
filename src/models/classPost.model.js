const mongoose = require('mongoose');
const commentSchema = require('./comment.model');

const classPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['assignment', 'announcement'],
        required: true,
    },
    attachments: [{
        type: String,
    }],
    comments: [{
        type: commentSchema,
        ref: 'Comment',
        default: [],
    }],
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignment',
    },

}, {
    timestamps: true,
    collection: 'class_posts',
})


const ClassPost = mongoose.model('ClassPost', classPostSchema);


module.exports = ClassPost;