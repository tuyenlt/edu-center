const mongoose = require('mongoose')
const User = require('./user.model')
const Message = require('./message.model')

const ChatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "users"
    }
    ,
    members: [{
        type: mongoose.Types.ObjectId,
        ref: "users"
    }],
    messages: [{
        type: mongoose.Types.ObjectId,
        ref: "messages"
    }],
    type: {
        type: String,
        required: true,
        enum: ["public", "private"]
    }
}, {
    timestamps: true,
    collection: "chatrooms"
})

ChatRoomSchema.pre('deleteOne', async function (next) {
    const users = await User.find({ 'chatrooms.chat_id': this._id })
    users.forEach(async (user) => {
        user.chatrooms = user.chatrooms.filter(chat_id => chat_id != this._id)
        await user.save()
    })

    await Message.deleteMany({ chat_id: this._id })
    next()
})

const Chatroom = mongoose.model("chatrooms", ChatRoomSchema)

module.exports = Chatroom
