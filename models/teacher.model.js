const mongoose = require('mongoose');
const User = require('./user.model')

const teacherSchema = new mongoose.Schema({
    subjects: [{ type: String }],
    level: { type: String, default: "low" },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    salaryInfo: {
        salary: { type: Number, defalut: 0 },
        bankAccount: { type: String },
        paymentMethod: { type: String, enum: ['bank_transfer', 'cash'] }
    }
});

const Teacher = User.discriminator('teacher', teacherSchema);

module.exports = Teacher