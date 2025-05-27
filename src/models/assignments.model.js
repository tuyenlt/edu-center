const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classes',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    due_date: {
        type: Date,
        required: true
    },
    max_score: {
        type: Number,
        required: true
    },
    links: [{
        type: String
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    submissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'submissions'
        }
    ]
}, { timestamps: true, collection: "assignments" });

const AssignmentModel = mongoose.model('assignments', assignmentSchema);

module.exports = AssignmentModel;
