const mongoose = require('mongoose');
const commentSchema = require('./comment.model');

const classPostSchema = new mongoose.Schema({
    title: {
        type: String,
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
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    type: {
        type: String,
        enum: ['assignment', 'announcement'],
        required: true,
    },
    links: [{
        type: String,
    }],
    attachments: [{
        type: String,
    }],
    comments: [{
        type: commentSchema,
        default: [],
    }],
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignments',
    },

}, {
    timestamps: true,
    collection: 'class_posts',
})


const ClassPost = mongoose.model('class_posts', classPostSchema);


module.exports = ClassPost;