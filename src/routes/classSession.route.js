const router = require('express').Router()
const classSessionController = require('../controllers/class_session.controller')
const auth = require('../middlewares/auth')
const authorizeRole = require('../middlewares/authorizeRole')

router.post('/class-sessions', auth, authorizeRole(['manager']), classSessionController.createClassSession)
router.get('/class-sessions', auth, classSessionController.getAllClassSessions)
router.get('/class-sessions/:id', auth, classSessionController.getClassSessionById)
router.patch('/class-sessions/:id', auth, authorizeRole(['manager']), classSessionController.editClassSession)
router.delete('/class-sessions/:id', auth, authorizeRole(['manager']), classSessionController.deleteClassSession)


module.exports = router