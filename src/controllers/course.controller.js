const CourseModel = require('../models/course.model')

const courseController = {
    getAllCourses: async (req, res) => {
        try {
            const courses = await CourseModel.find()
            res.json(courses)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
    getCourseById: async (req, res) => {
        try {
            const course = await CourseModel.findById(req.params.id)
            if (!course) {
                return res.status(404).json({ error: "Course not found" })
            }
            res.json(course)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
    createCourse: async (req, res) => {
        try {
            const course = new CourseModel(req.body)
            await course.save()
            res.status(201).json(course)
        } catch (error) {
            res.status(400).json({ error: error })
        }
    },
    editCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            const updateData = req.body;

            const updatedCourse = await CourseModel.findByIdAndUpdate(
                courseId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedCourse) {
                return res.status(404).json({ message: 'Course not found' });
            }

            return res.status(200).json({
                message: 'Course updated successfully',
                data: updatedCourse
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error });
        }
    },
    deleteCourse: async (req, res) => {
        try {
            const courseId = req.params.id;

            const deletedCourse = await CourseModel.findByIdAndDelete(courseId);

            if (!deletedCourse) {
                return res.status(404).json({ message: 'Course not found' });
            }

            return res.status(200).json({
                message: 'Course deleted successfully',
                data: deletedCourse
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error });
        }
    }
}

module.exports = courseController