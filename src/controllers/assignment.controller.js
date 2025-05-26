const AssignmentModel = require('../models/assignments.model')
const StudentModel = require('../models/student.model')
const TeacherModel = require('../models/teacher.model')
const ClassModel = require('../models/class.model');
const { default: mongoose } = require('mongoose');
const { get } = require('../models/comment.model');

const assignmentController = {
    addAssignment: async (req, res) => {
        const transSession = await mongoose.startSession();
        try {
            await transSession.withTransaction(async () => {
                const assignment = new AssignmentModel(req.body);
                await assignment.save();

                await ClassModel.updateOne(
                    { _id: assignment.class },
                    { $push: { assignments: assignment._id } }
                );

                await StudentModel.updateMany(
                    { _id: { $in: assignment.students } },
                    { $push: { assignments: assignment._id } }
                )

                await TeacherModel.updateOne(
                    { _id: assignment.teacher },
                    { $push: { assignments: assignment._id } }
                );
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
            const assignment = await AssignmentModel.findById(assignmentId);
            if (!assignment) {
                return res.status(404).json({ message: "Assignment not found" });
            }

            if (req.user._id.toString() !== assignment.teacher.toString()) {
                return res.status(403).json({ message: "You are not authorized to delete this assignment" });
            }

            if (assignment.submissions.length > 0) {
                return res.status(400).json({ message: "Cannot delete assignment with submissions" });
            }

            await AssignmentModel.deleteOne({ _id: assignmentId });

            await ClassModel.updateOne(
                { _id: assignment.class_id },
                { $pull: { assignments: assignmentId } }
            );

            await StudentModel.updateMany(
                { _id: { $in: assignment.students } },
                { $pull: { assignments: assignmentId } }
            );

            await TeacherModel.updateOne(
                { _id: assignment.teacher },
                { $pull: { assignments: assignmentId } }
            );

            res.status(200).json({ message: "Assignment deleted successfully" });
        } catch (error) {
            console.error("Error deleting assignment:", error);
            res.status(500).json({ error: error.message });
        }
    },
    addSubmission: async (req, res) => {
        try {
            const assignmentId = req.params.id;
            const assignment = await AssignmentModel.findById(assignmentId);
            const learningClass = await ClassModel.findById(assignment.class);
            const student_id = req.user._id;
            if (!learningClass.students.includes(student_id)) {
                return res.status(400).json({ error: "not in class" });
            }

            const submission = req.body;

            assignment.submissions.push(submission);
            await assignment.save()

            res.status(200).json(assignment);

        } catch (error) {
            console.error("Error adding submission:", error);
            res.status(500).json(error);
        }
    },
    getAssignmentByClass: async (req, res) => {
        try {
            const classId = req.params.classId;
            const assignments = await AssignmentModel.find({ class: classId });
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
                    select: 'name code'
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
                    path: 'submissions.student',
                    select: '_id name email avatar_url'
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
    }
};

module.exports = assignmentController;