const mongoose = require('mongoose')
const ChatroomModel = require('./chatroom.model')
const AssignmentModel = require('./assignments.model')

const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        required: true
    },
    class_code: {
        type: String,
        required: true
    },
    course_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "courses"
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
    chat_id: {
        type: mongoose.Types.ObjectId,
        ref: 'chatrooms'
    },
    notes: {
        type: String
    },
    students: [{
        type: mongoose.Types.ObjectId,
        ref: 'student',
    }],
    class_sessions: [{
        type: mongoose.Types.ObjectId,
        ref: 'class_sessions'
    }],
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'finished'],
        require: true
    },
    assignments: [{
        type: mongoose.Types.ObjectId,
        ref: 'assignment'
    }]
}, {
    timestamps: true,
    collection: "classes"
})

classSchema.pre('deleteOne', async function (next) {
    if (!this.chat_id) {
        next()
    }
    await ChatroomModel.deleteOne({ _id: this.chat_id })
    await AssignmentModel.deleteMany({ class_id: this.id })
    next()
})

const ClassModel = mongoose.model('classes', classSchema)

module.exports = ClassModel
