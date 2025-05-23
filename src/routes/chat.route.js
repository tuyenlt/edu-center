const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')

const chatController = require('../controllers/chat.controller')


router.post("/chatrooms", auth, chatController.createNewChatroom)
router.get("/chatrooms/:id", auth, chatController.getChatRoomById)
router.post("/chatrooms/:id/join", auth, chatController.joinChat)
router.post("/chatrooms/:id/add-member", auth, chatController.addNewMembers)
router.post("/chatrooms/:id/leave", auth, chatController.leaveChat)
router.get("/chat-of-user", auth, chatController.getUserChatrooms)
router.get("/chatrooms-contact/", auth, chatController.getContactChatrooms)
router.post("/chatrooms-contact/:id/join", auth, chatController.takeStudentContactChat)


module.exports = router