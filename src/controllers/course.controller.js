const CourseModel = require('../models/course.model')
const NotifyModel = require('../models/notify.model')
const StudentModel = require('../models/student.model')
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
			const course = await CourseModel.findById(req.params.id).populate({
				path: "requested_students",
				select: "_id name email avatar_url"
			})
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
				select: "course",
			});

			const course = await CourseModel.findById(courseId);
			if (!course) {
				return res.status(404).json({ message: 'Course not found' });
			}

			const isAlreadyEnrolled = student.enrolled_classes.some(
				(enrolledClass) => enrolledClass.course.toString() === courseId
			);
			if (isAlreadyEnrolled) {
				return res.status(400).json({ message: 'Already enrolled in this course' });
			}

			const identifier = `${student._id}${courseId}`;
			const isRequested = course.requested_students.includes(req.user._id);

			if (isRequested) {
				course.requested_students = course.requested_students.filter(
					studentId => studentId.toString() !== req.user._id.toString()
				);

				await NotifyModel.deleteOne({ identifier });
			} else {
				course.requested_students.push(req.user._id);

				const managers = await User.find({ role: 'manager' });

				const notification = await NotifyModel.create({
					title: `New student request to ${course.name}`,
					content: `${student.name} has requested to join the course ${course.name}`,
					type: 'course_request',
					link: `/course/${courseId}`,
					users: managers.map(m => m._id),
					identifier
				});

				// send notification to users by websocket
				for (const userId of notification.users) {
					webSocketService.sendUserNotification(userId, notification);
				}
			}

			await course.save();

			return res.status(200).json({
				message: isRequested ? 'Request canceled' : 'Request sent successfully',
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error', error });
		}
	},
	getRequestedStudents: async (req, res) => {
		try {
			const classId = req.params.id;
			const course = await CourseModel.findById(classId).populate({
				path: "requested_students",
				select: "_id name email avatar_url"
			})

			if (!course) {
				return res.status(404).json({ message: 'Class not found' });
			}

			if (!course.requested_students.length) {
				return res.status(404).json({ message: 'No students requested' });
			}

			return res.status(200).json(course.requested_students);
		} catch (error) {
			console.error(error)
			res.status(500).json({ error: error })
		}
	},
}

module.exports = courseController