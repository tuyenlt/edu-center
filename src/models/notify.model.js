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
    link: {
        type: String
    }
}, {
    collection: 'notifies',
    timestamps: true
})

const notifyModel = mongoose.model('notifies', notifySchema)

module.exports = notifyModel