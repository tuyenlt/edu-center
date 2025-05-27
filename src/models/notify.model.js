const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
    users: [{
        type: mongoose.Types.ObjectId,
        ref: 'users'
    }],
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    type: {
        type: String,
    },
    link: {
        type: String
    }
}, {
    collection: 'notifies',
    timestamps: true
})

const NotifyModel = mongoose.model('notifies', notifySchema)

module.exports = NotifyModel