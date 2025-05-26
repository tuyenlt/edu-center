const mongoose = require('mongoose')

const BillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['tuition', 'salary', 'other']
    },
    status: {
        type: String,
        required: true,
        enum: ['paid', 'unpaid', 'pending']
    },
    payment_method: {
        type: String,
        required: function () {
            return this.status === 'paid';
        },
        enum: ['cash', 'banking']
    },
    payment_details: {
        transactionId: {
            type: String,
        },
        bankName: {
            type: String,
            required: function () {
                return this.payment_method === 'banking';
            }
        }
    },
    course: {
        type: mongoose.Types.ObjectId,
        ref: "courses",
        required: function () {
            return this.type === 'tuition';
        }
    },
    session: {
        type: mongoose.Types.ObjectId,
        ref: 'class_sessions',
        required: function () {
            return this.type === 'salary';
        }
    },
}, {
    timestamps: true,
    collection: 'bills'
})

const BillModel = mongoose.model('bills', BillSchema)

module.exports = BillModel