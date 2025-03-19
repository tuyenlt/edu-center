const AssignmentModel = require('../models/assignments.model')
const StudentModel = require('../models/student.model')
const TeacherModel = require('../models/teacher.model')
const ClassModel = require('../models/class.model')

const assignmentController = {
    addAssignment: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }
            if (req.user._id.toString() !== classDoc.teacher_id.toString()) {
                return res.status(403).json({ message: "You are not allowed to add assignments" });
            }

            const assignment = new AssignmentModel(req.body);
            classDoc.assignments.push(assignment._id);

            await classDoc.save();
            await assignment.save();

            return res.status(201).json({
                message: "Assignment added successfully",
                data: assignment,
            });
        } catch (error) {
            return res.status(500).json({ message: "Something went wrong", error: error.message });
        }
    }
};

module.exports = assignmentController;