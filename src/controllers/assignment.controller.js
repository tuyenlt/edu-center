const AssignmentModel = require('../models/assignments.model')
const StudentModel = require('../models/student.model')
const TeacherModel = require('../models/teacher.model')
const ClassModel = require('../models/class.model');
const { default: mongoose } = require('mongoose');
const { get } = require('../models/comment.model');
const SubmissionModel = require('../models/submissons.model');
const ClassPost = require('../models/classPost.model');
const webSocketService = require('../services/webSocket.service');
const NotifyModel = require('../models/notify.model');
const User = require('../models/user.model');

const assignmentController = {
	addAssignment: async (req, res) => {
		const transSession = await mongoose.startSession();
		try {
			await transSession.withTransaction(async () => {
				const assignment = new AssignmentModel(req.body);
				await assignment.save();


				const classPost = await ClassPost.create({
					classId: assignment.class,
					author: assignment.teacher,
					type: 'assignment',
					content: assignment.description,
					title: assignment.title,
					assignment: assignment._id,
				}).then(async post => {
					const populatedPost = await post.populate({
						path: "author",
						select: "_id name email avatar_url"
					})
					return populatedPost;
				})

				await ClassModel.updateOne(
					{ _id: assignment.class },
					{ $push: { assignments: assignment._id, class_posts: classPost._id } }
				);


				await StudentModel.updateMany(
					{ _id: { $in: assignment.students } },
					{ $push: { assignments: assignment._id } }
				)

				await TeacherModel.updateOne(
					{ _id: assignment.teacher },
					{ $push: { assignments: assignment._id } }
				);

				const notification = await NotifyModel.create({
					type: 'assignment',
					title: assignment.title,
					content: `New assignment: ${assignment.title}`,
					users: assignment.students,
					link: `/class/${assignment.class}`,
				})

				// send notification to users by websocket
				for (const userId of notification.users) {
					webSocketService.sendUserNotification(userId, notification);
				}

				webSocketService.io.to(assignment.class.toString()).emit('classPostCreate', classPost);

				res.status(200).json(assignment);
			})

		} catch (error) {
			transSession.abortTransaction();
			console.error("Transaction failed:", error);
			return res.status(500).json({ message: "add assignment failed", error: error.message });

		}
	},
	updateAssignment: async (req, res) => {
		try {
			const allowedUpdateFields = ['title', 'description', 'due_date'];
			const updateFields = Object.keys(req.body).filter(field => allowedUpdateFields.includes(field));

			if (updateFields.length === 0) {
				return res.status(400).json({ message: "No valid fields to update" });
			}

			const assignment = await AssignmentModel.findById(req.params.id);

			Object.keys(updateFields).forEach(field => {
				assignment[field] = updateFields[field];
			})

			await assignment.save();

			res.status(200).json(assignment);
		} catch (error) {
			console.error("Error updating assignment:", error);
			res.status(500).json({ error: error.message });
		}

	},
	deleteAssignment: async (req, res) => {
		try {
			const assignmentId = req.params.id;

			const assignment = await AssignmentModel.findById(assignmentId).lean();
			if (!assignment) {
				return res.status(404).json({ message: "Assignment not found" });
			}

			if (req.user._id.toString() !== assignment.teacher.toString()) {
				return res.status(403).json({ message: "You are not authorized to delete this assignment" });
			}

			if (assignment.submissions && assignment.submissions.length > 0) {
				return res.status(400).json({ message: "Cannot delete assignment with submissions" });
			}

			await Promise.all([
				ClassModel.updateOne(
					{ _id: assignment.class_id },
					{ $pull: { assignments: assignmentId } }
				),
				ClassPost.deleteOne({ assignment: assignmentId }),
				StudentModel.updateMany(
					{ _id: { $in: assignment.students } },
					{ $pull: { assignments: assignmentId } }
				),
				TeacherModel.updateOne(
					{ _id: assignment.teacher },
					{ $pull: { assignments: assignmentId } }
				)
			]);

			await AssignmentModel.deleteOne({ _id: assignmentId });

			return res.status(200).json({ message: "Assignment deleted successfully" });

		} catch (error) {
			console.error("Error deleting assignment:", error);
			return res.status(500).json({ error: error.message });
		}
	},

	getAssignmentByClass: async (req, res) => {
		try {
			const classId = req.params.classId;
			const assignments = await AssignmentModel.find({ class: classId }).populate([
				{
					path: "teacher",
					select: '_id name email avatar_url'
				},
				{
					path: "class",
					select: 'class_name class_code'
				},
				{
					path: "students",
					select: '_id name email avatar_url'
				},
				{
					path: 'submissions',
				}
			]).sort({ due_date: -1 });
			res.status(200).json(assignments);
		} catch (error) {
			console.error("Error fetching assignments by class:", error);
			res.status(500).json({ error: error.message });
		}
	},
	getAssignmentOfUser: async (req, res) => {
		try {
			const userId = req.params.userId;
			const assignments = await AssignmentModel.find({
				$or: [
					{ students: userId },
					{ teacher: userId }
				]
			}).populate([
				{
					path: "class",
					select: 'class_name class_code'
				},
				{
					path: "submissions",
					select: '_id student score feedback',
				}
			]);
			res.status(200).json(assignments);
		} catch (error) {
			console.error("Error fetching assignments for user:", error);
			res.status(500).json({ error: error.message });
		}
	},
	getAssignmentById: async (req, res) => {
		try {
			const assignmentId = req.params.id;
			const assignment = await AssignmentModel.findById(assignmentId).populate([
				{
					path: 'submissions',
					populate: {
						path: 'student',
						select: '_id name email avatar_url'
					}
				},
				{
					path: "teacher",
					select: '_id name email avatar_url'
				},
				{
					path: 'class',
					select: 'class_name class_code'
				}
			])
			if (!assignment) {
				return res.status(404).json({ message: "Assignment not found" });
			}
			res.status(200).json(assignment);
		} catch (error) {
			console.error("Error fetching assignment by ID:", error);
			res.status(500).json({ error: error.message });
		}
	},
	addSubmission: async (req, res) => {
		try {
			const assignmentId = req.params.id;
			const student_id = req.user._id;
			const assignment = await AssignmentModel.findById(assignmentId);

			const submission = await SubmissionModel.create({
				assignment: assignmentId,
				student: student_id,
				...req.body
			});

			assignment.submissions.push(submission._id);
			await assignment.save()

			res.status(200).json(assignment);

		} catch (error) {
			console.error("Error adding submission:", error);
			res.status(500).json(error);
		}
	},
	gradeSubmission: async (req, res) => {
		try {
			const submissionId = req.params.id;
			const { score, feedback } = req.body;
			const submission = await SubmissionModel.findById(submissionId);

			submission.score = score;
			submission.feedback = feedback;

			await submission.save();

			res.status(200).json(submission);
		} catch (error) {
			console.error("Error grading submission:", error);
			res.status(500).json({ error: error.message });
		}
	}
};

module.exports = assignmentController;