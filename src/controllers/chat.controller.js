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

const chatController = {

    createNewChatroom: async (req, res) => {
        try {
            if (!req.body.name) {
                throw new Error('Chat room name is missing')
            }
            if (req.body.type === "student-contacting") {
                const studentContactingChatroom = await Chatroom.findOne({ type: "student-contacting", owner: req.user._id });
                if (studentContactingChatroom) {
                    return res.status(200).json(studentContactingChatroom);
                }
            }
            const chatroom = new Chatroom({
                owner: req.user._id,
                members: [
                    req.user._id,
                ],
                ...req.body
            })
            await chatroom.save()

            const user = await User.findById(req.user._id);
            user.chatrooms.push(chatroom._id);
            await user.save();
            return res.send(chatroom)
        } catch (e) {
            res.status(500).send(e.message)
        }
    },

    addNewMembers: async (req, res) => {
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
    },

    joinChat: async (req, res) => {
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
    },


    leaveChat: async (req, res) => {
        try {
            const chatroom = await validateChatId(req.params.id)

            if (!chatroom.members.map(id => id.toString()).includes(req.user._id.toString())) {
                return res.status(403).json({ error: "You are not a member of this chatroom" });
            }

            chatroom.members = chatroom.members.filter(
                id => id.toString() !== req.user._id.toString()
            );

            if (chatroom.owner.toString() === req.user.toString()) {
                if (chatroom.members.length > 0) {
                    chatroom.owner = chatroom.members[0];
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
    },
    getChatMessage: async (req, res) => {
        try {
            const chatroom = await validateChatId(req.params.id)
            let messagesLimit = req.query.limit;
            let rangeIndex = req.query.index;

            // if (!chatroom.members.map(id => id.toString()).includes(req.user._id.toString())) {
            //     return res.status(403).json({ error: "You are not a member of this chatroom" });
            // }

            if (!messagesLimit || !rangeIndex) {
                // TODO get all
                rangeIndex = 0;
                messagesLimit = 9000;
            }

            const chatData = await chatroom.populate({
                path: "messages",
                options: {
                    skip: rangeIndex * messagesLimit,
                    limit: messagesLimit
                },
                populate: {
                    path: "author",
                    select: "name avatar_url"
                }
            })
            console.log(chatData)
            res.status(200).json(chatData);
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: "error getting chat message" })
        }
    },
    getUserChatrooms: async (req, res) => {
        try {
            const chatrooms = await User.findById(req.user._id).populate("chatrooms");
            res.status(200).json(chatrooms.chatrooms);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "error getting chat message" })
        }
    },
    getStudentContacting: async (req, res) => {
        try {
            const chatrooms = await Chatroom.find({ type: "student-contacting", taken: false }).populate({
                path: "owner",
                select: "name avatar_url"
            });
            res.status(200).json(chatrooms);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "error getting chat message" })
        }
    },
    joinStudentContacting: async (req, res) => {
        try {
            const chatroom = await validateChatId(req.params.id)

            if (chatroom.taken) {
                return res.status(403).json({ error: "Already taken" });
            }
            const user = await User.findById(req.user._id);
            chatroom.taken = true;
            chatroom.members.push(req.user._id);
            user.chatrooms.push(chatroom._id);
            await user.save();
            await chatroom.save()

            res.send("success")

        } catch (e) {
            res.status(500).send(e.message)
        }
    }

}
module.exports = chatController