const assignmentController = require('../controllers/assignment.controller');

const express = require('express');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole');

const router = express.Router();

router.use(auth);
router.get('/assignments/:id', assignmentController.getAssignmentById);
router.post('/assignments', authorizeRole(['teacher']), assignmentController.addAssignment);
router.patch('/assignments/:id', authorizeRole(['teacher']), assignmentController.updateAssignment);
router.delete('/assignments/:id', authorizeRole(['teacher']), assignmentController.deleteAssignment);
router.get('/assignments/class/:classId', assignmentController.getAssignmentByClass);
router.get('/assignments/user/:userId', assignmentController.getAssignmentOfUser);
router.post('/assignments/:id/submit', assignmentController.addSubmission);

module.exports = router;    