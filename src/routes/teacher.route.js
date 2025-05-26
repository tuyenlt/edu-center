const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole');
const teacherController = require('../controllers/teacher.controller');

router.use(auth);
router.get('/teachers/list', authorizeRole(['manager', 'staff']), teacherController.getTeacherList);
router.post('/teachers/:id/add-session', authorizeRole(['manager', 'staff']), teacherController.addAttendedSession);


module.exports = router;