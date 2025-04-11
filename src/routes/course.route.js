const courseController = require('../controllers/course.controller');

const router = require('express').Router();

router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', courseController.createCourse);
router.patch('/courses/:id', courseController.editCourse);
router.delete('/courses/:id', courseController.deleteCourse);

module.exports = router;