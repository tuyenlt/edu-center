const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignments',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    quiz_answers: [{
        type: String
    }],
    links: [{
        type: String
    }],
    score: {
        type: Number
    },
    feedback: {
        type: String
    },
}, {
    timestamps: true,
    collection: "submissions"
})

const SubmissionModel = mongoose.model('submissions', SubmissionSchema);


module.exports = SubmissionModel;