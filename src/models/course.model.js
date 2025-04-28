const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    goal: {
        type: String,
        required: true,
    },
    course_level: {
        type: String,
        required: true,
    },
    img_url: {
        type: String,
        required: true
    },
    sessions_details: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        type: {
            type: String,
        }
    }],
    requested_students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students'
    }],
    tags: [{
        type: String,
    }],
    price: {
        type: Number,
        required: true
    },
}, {
    timestamps: true,
    collection: 'courses'
})

const CourseModel = mongoose.model('courses', CourseSchema)

module.exports = CourseModel