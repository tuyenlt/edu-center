const mongoose = require('mongoose');
const User = require('./user.model');

const teacherSchema = new mongoose.Schema({
    enrolled_classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }],
    hourly_wage: {
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
        },
        address: {
            type: String,
        },
        tax_number: {
            type: String,
        },
        id_card: {
            type: String,
        },
    },
    payment_info: {
        bank_account: {
            type: String,
        },
        bank_name: {
            type: String,
        },
        account_holder_name: {
            type: String,
        }
    }
});



const Teacher = User.discriminator('teacher', teacherSchema);

module.exports = Teacher