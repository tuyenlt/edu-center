const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classes',
        required: true
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
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
    submissions: [{
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'students',
            required: true
        },
        text: {
            type: String
        },
        file_url: {
            type: String
        },
        submitted_at: {
            type: Date,
            default: Date.now
        },
        score: {
            type: Number
        },
        feedback: {
            type: String
        }
    }]
}, { timestamps: true, collection: "assignments" });

const AssignmentModel = mongoose.model('assignments', assignmentSchema);

module.exports = AssignmentModel;
