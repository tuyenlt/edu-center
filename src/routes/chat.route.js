const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')

const chatController = require('../controllers/chat.controller')


router.post("/chatrooms", auth, chatController.createNewChatroom)
router.get("/chatrooms/:id", auth, chatController.getChatMessage)
router.post("/chatrooms/:id/join", auth, chatController.joinChat)
router.post("/chatrooms/:id/add-member", auth, chatController.addNewMembers)
router.post("/chatrooms/:id/add-message", auth, chatController.addNewMessage)
router.post("/chatrooms/:id/leave", auth, chatController.leaveChat)


module.exports = router