const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    chat_id: {
        type: mongoose.Types.ObjectId,
        ref: 'chatrooms',
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    reactions: {
        likes: Number,
        dislikes: Number,
        heart: Number,
    }

}, {
    timestamps: true,
    collection: "messages"
})

const Message = mongoose.model("messages", MessageSchema)

module.exports = Message