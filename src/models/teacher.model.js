const mongoose = require('mongoose');
const User = require('./user.model')

const teacherSchema = new mongoose.Schema({
    assigned_classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    fixed_salary: {
        type: Number,
        required: true,
    },
    assignments: [{
        type: mongoose.Types.ObjectId,
        ref: "assignments"
    }],
    attended_class_sessions: [{
        class_session: {
            type: mongoose.Types.ObjectId,
            ref: 'class_sessions'
        },
        is_paid: {
            type: Boolean,
            default: false
        },
    }],
    personal_info: {
        dob: {
            type: Date,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        tax_number: {
            type: String,
            required: true
        },
        id_card: {
            type: String,
            required: true
        },
    },
    payment_info: {
        bank_account: {
            type: String,
            required: true
        },
        bank_name: {
            type: String,
            required: true
        },
        account_holder_name: {
            type: String,
            required: true
        }
    }

});

const Teacher = User.discriminator('teacher', teacherSchema);

module.exports = Teacher