const mongoose = require('mongoose')
const Chatroom = require('./chatroom.model')

const MessageSchema = new mongoose.Schema({
    author: {
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
}, {
    timestamps: true,
    collection: "messages"
})

MessageSchema.pre('save', async function (next) {
    const chatRoom = await Chatroom.findById(this.chat_id);
    chatRoom.messages.push(this._id);
    await chatRoom.save();
    next()
})

MessageSchema.pre('deleteOne', async function (next) {
    const chatRoom = await Chatroom.findById(this.chat_id);
    chatRoom.messages = chatRoom.messages.filter(_id => _id.toString() !== this._id.toString());
    await chatRoom.save();
    next()
})

const Message = mongoose.model("messages", MessageSchema)

module.exports = Message