const CourseModel = require('../models/course.model')
const User = require('../models/user.model')

const courseController = {
    getAllCourses: async (req, res) => {
        try {
            const courses = await CourseModel.find().populate({
                path: "requested_students",
                select: "_id name email avatar_url"
            })
            res.json(courses)
        } catch (error) {
            console.error(error)
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
            console.error(error)
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
    },
    studentRequest: async (req, res) => {
        try {
            const courseId = req.params.id;
            const student = await User.findById(req.user._id).populate({
                path: "enrolled_classes",
                select: "course_id",
                populate: {
                    path: "course_id",
                    select: "_id"
                }
            })

            console.log(student)

            const course = await CourseModel.findById(courseId);

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            console.log(student.enrolled_classes)

            for (const enrolledClass of student.enrolled_classes) {
                if (enrolledClass.course_id._id.toString() === courseId) {
                    return res.status(400).json({ message: 'Already enrolled in this course' });
                }
            }

            if (course.requested_students.includes(req.user._id)) {
                course.requested_students = course.requested_students.filter(studentId => studentId.toString() !== req.user._id.toString());
            } else {
                course.requested_students.push(req.user._id);
            }
            await course.save();

            return res.status(200).json({
                message: 'Request sent successfully',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error });
        }
    }
}

module.exports = courseController