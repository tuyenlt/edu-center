const Chatroom = require('../models/chatroom.model')
const Message = require('../models/message.model')
const User = require('../models/user.model')


const validateChatId = async (chat_id) => {
    if (!chat_id) {
        throw new Error("Enter a chat id")
    }

    const chatroom = await Chatroom.findOne({ _id: chat_id });

    if (!chatroom) {
        throw new Error("Invalid room id")
    }

    return chatroom
}



const createNewChatroom = async (req, res) => {
    try {
        if (!req.body.name) {
            throw new Error('Chat room name is missing')
        }
        const chatroom = new Chatroom({
            name: req.body.name,
            owner_id: req.user._id,
            members: [
                req.user._id,
            ]
        })
        await chatroom.save()
        return res.send(chatroom)
    } catch (e) {
        res.status(500).send(e.message)
    }
}


const addNewMembers = async (req, res) => {
    try {
        const chatroom = await validateChatId(req.params.id)

        if (!req.body.new_members || !Array.isArray(req.body.new_members)) {
            return res.status(400).json({ error: "No members included" });
        }

        if (req.user._id.toString() !== chatroom.owner_id.toString()) {
            return res.status(403).json({ error: "Permission Denied" });
        }

        const newMembers = req.body.new_members.filter(member_id =>
            !chatroom.members.includes(member_id)
        );

        const users = await User.find({ _id: { $in: newMembers } });

        for (const user of users) {
            chatroom.members.push(user._id);
            user.chatrooms.push(chatroom._id);
            await user.save();
        }

        await chatroom.save();

        res.json({ message: "Success" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

const addNewMessage = async (req, res) => {
    try {
        const chatroom = await validateChatId(req.params.id)

        if (!req.body.message) {
            return res.status(401).json({ error: "No message content" })
        }

        if (!chatroom.members.map(id => id.toString()).includes(req.user._id.toString())) {
            return res.status(403).json({ error: "Permission Denied" });
        }

        const message = new Message({
            owner_id: req.user._id,
            chat_id: chatroom._id,
            content: req.body.message
        })
        chatroom.messages.push(message._id)

        await message.save()
        await chatroom.save()

        res.send(message)
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: e.message })
    }
}


const joinChat = async (req, res) => {
    try {
        const chatroom = await validateChatId(req.params.id)

        if (chatroom.type === "private") {
            return res.status(403).json({ error: "Permission denied" })
        }

        if (chatroom.members.map(id => id.toString()).includes(req.user._id.toString())) {
            return res.status(403).json({ error: "Already in chat" });
        }

        chatroom.members.push(req.user._id);
        req.user.chatrooms.push(chatroom._id);
        await req.user.save();
        await chatroom.save()

        res.send("success")

    } catch (e) {
        res.status(500).send(e.message)
    }
}


const leaveChat = async (req, res) => {
    try {
        const chatroom = await validateChatId(req.params.id)

        if (!chatroom.members.map(id => id.toString()).includes(req.user._id.toString())) {
            return res.status(403).json({ error: "You are not a member of this chatroom" });
        }

        chatroom.members = chatroom.members.filter(
            id => id.toString() !== req.user._id.toString()
        );

        if (chatroom.owner_id.toString() === req.user._id.toString()) {
            if (chatroom.members.length > 0) {
                chatroom.owner_id = chatroom.members[0];
            } else {
                await Chatroom.deleteOne({ _id: chatroom._id });
                return res.json({ message: "Chatroom deleted as last member left" });
            }
        }

        await chatroom.save();

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { chatrooms: chatroom._id } }
        );

        res.json({ message: "Successfully left the chatroom" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}

const getChatMessage = async (req, res) => {
    try {
        const chatroom = await validateChatId(req.params.id)

        if (!chatroom.members.map(id => id.toString()).includes(req.user._id.toString())) {
            return res.status(403).json({ error: "You are not a member of this chatroom" });
        }

        const messages = await chatroom.populate('messages')

        if (!req.query.page) {
            return res.json(messages)
        }

        res.json(chatroom.populate('messages'))

    } catch (e) {

    }
}

module.exports = {
    createNewChatroom,
    addNewMembers,
    joinChat,
    addNewMessage,
    getChatMessage,
    leaveChat
}