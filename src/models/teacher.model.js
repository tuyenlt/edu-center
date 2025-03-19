const mongoose = require('mongoose');
const User = require('./user.model')

const teacherSchema = new mongoose.Schema({
    assigned_classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    fixed_salary: {
        type: Number,
        required: true,
    },
    tax_number: {
        type: String,
        required: true,
    },
    unpaid_lecture: {
        type: Number
    },
    assignments: [{
        type: mongoose.Types.ObjectId,
        ref: "assignments"
    }],
    attended_class_sessions: [{
        type: mongoose.Types.ObjectId,
        ref: 'class_sessions'
    }],
});

const Teacher = User.discriminator('teacher', teacherSchema);

module.exports = Teacher