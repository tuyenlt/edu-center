const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        required: true
    },
    class_code: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ["Beginer", "Intermediate", "Advanced"],
        required: true
    },
    course_id: {
        type: mongoose.Types.ObjectId,
        required: true
    }
    ,
    teacher_id: {
        type: mongoose.Types.ObjectId,
        ref: 'teacher'
    },
    max_students: {
        type: Number,
        required: true,
    },
    current_student: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String
    },
    students: [{
        student_id: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'student',
        },
        join_at: {
            type: Date,
            required: true
        }
    }],
    schedule: [{
        start_time: {
            type: Date,
            required: true
        },
        end_time: {
            type: Date,
            required: true
        }
    }]
}, {
    timestamps: true,
    collection: "classes"
})

const ClassModel = new mongoose.model('classes', classSchema)

module.exports = ClassModel
