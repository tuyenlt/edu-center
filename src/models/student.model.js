const User = require('./user.model')
const mongoose = require('mongoose')
const ClassModel = require('./class.model')

const studentSchema = new mongoose.Schema({
    enrolled_classes: [{
        type: mongoose.Types.ObjectId,
        ref: 'classes'
    }],
    outstanding_fees: { type: Number, default: 0 },
    paid_fees: { type: Number, default: 0 },
    attended_class_sessions: [{
        type: mongoose.Types.ObjectId,
        ref: 'class_sessions'
    }],
    assignments: [{
        type: mongoose.Types.ObjectId,
        ref: "assignments"
    }]
})

const Student = User.discriminator('student', studentSchema)


module.exports = Student