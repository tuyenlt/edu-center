const mongoose = require('mongoose')

const BillSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: String,
    payment_method: {
        type: String,
        required: true,
        enum: ['cash', 'onlineBanking']
    },
    course: {
        type: mongoose.Types.ObjectId,
        ref: "courses"
    },
    sessions: [{
        type: mongoose.Types.ObjectId,
        ref: 'class_sessions'
    }],
}, {
    timestamps: true,
    collection: 'bills'
})

const BillModel = mongoose.model('bills', BillSchema)

module.exports = BillModel