const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')

const chatController = require('../controllers/chat.controller')


router.post("/chatrooms", auth, chatController.createNewChatroom)
router.get("/chatrooms/:id", auth, chatController.getChatMessage)
router.post("/chatrooms/:id/join", auth, chatController.joinChat)
router.post("/chatrooms/:id/add-member", auth, chatController.addNewMembers)
router.post("/chatrooms/:id/leave", auth, chatController.leaveChat)
router.get("/chat-of-user", auth, chatController.getUserChatrooms)
router.get("/student-contacting", auth, chatController.getStudentContacting)
router.post("/student-contacting/:id/join", auth, chatController.joinStudentContacting)


module.exports = router