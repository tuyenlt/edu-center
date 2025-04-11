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
    tags: [{
        type: String,
    }],
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    collection: 'courses'
})

const CourseModel = mongoose.model('courses', CourseSchema)

module.exports = CourseModel