const courseController = require('../controllers/course.controller');
const auth = require('../middlewares/auth');
const authorizeRole = require('../middlewares/authorizeRole');

const router = require('express').Router();

router.get('/courses', auth, courseController.getAllCourses);
router.get('/courses/:id', auth, courseController.getCourseById);
router.post('/courses', auth, courseController.createCourse);
router.patch('/courses/:id', auth, courseController.editCourse);
router.delete('/courses/:id', auth, courseController.deleteCourse);
router.post('/courses/:id/enroll', auth, authorizeRole(["student"]), courseController.studentRequest);
router.get('/courses/:id/requested-students', auth, authorizeRole(["manager"], ["staff"]), courseController.getRequestedStudents);

module.exports = router;