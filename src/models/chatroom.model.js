const mongoose = require('mongoose')
const User = require('./user.model')
// const Message = require('./message.model')

const ChatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    avatar_url: {
        type: String,
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
        enum: ["class-chat", "contact", "p2p", "group"],
    },
    taken: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true,
    collection: "chatrooms"
})

ChatRoomSchema.pre('deleteOne', async function (next) {
    const users = await User.find({ 'chatrooms._id': this._id })
    users.forEach(async (user) => {
        user.chatrooms = user.chatrooms.filter(_id => _id !== this._id)
        await user.save()
    })
    next()
})

const Chatroom = mongoose.model("chatrooms", ChatRoomSchema)

module.exports = Chatroom
