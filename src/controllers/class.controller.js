const ClassModel = require('../models/class.model');
const createError = require('http-errors')
const ClassSessionModel = require('../models/class_session.model')
const UserModel = require('../models/user.model')

const classController = {
    createClass: async (req, res) => {
        try {
            const newClass = new ClassModel(req.body);
            await newClass.save();
            res.status(201).json(newClass);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getAllClasses: async (req, res) => {
        try {
            const classes = await ClassModel.find();
            res.status(200).json(classes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getClassById: async (req, res) => {
        try {
            let query = ClassModel.findById(req.params.id);


            const { populateFields } = req.body;

            if (populateFields?.includes("course_id")) {
                query = query.populate({
                    path: "course_id",
                    select: "name goal course_level"
                });
            }
            if (populateFields?.includes("teacher_id")) {
                query = query.populate({
                    path: "teacher_id",
                    select: "name profile_img"
                });
            }
            if (populateFields?.includes("students")) {
                query = query.populate({
                    path: "students",
                    select: "_id name"
                });
            }
            if (populateFields?.includes("class_sessions")) {
                query = query.populate({
                    path: "class_sessions",
                    select: "start_time end_time title"
                });
            }
            if (populateFields?.includes("assignments")) {
                query = query.populate({
                    path: "assignments",
                    select: "title due_date max_score"
                });
            }

            const classes = await query.exec();
            res.status(200).json(classes);
        } catch (error) {
            console.error("Error fetching classes:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    updateClass: async (req, res) => {
        try {
            const updateFields = Object.keys(req.body);
            const allowedUpdateFields = [
                'class_name', 'class_code', 'level', 'teacher_id',
                'max_students', 'schedule', 'notes'
            ];
            const isValidOperation = updateFields.every(field => allowedUpdateFields.includes(field));

            if (!isValidOperation) {
                return res.status(400).json({ error: "Invalid update field" });
            }

            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ error: "Class not found" });
            }

            updateFields.forEach(field => classDoc[field] = req.body[field]);
            await classDoc.save();
            res.json(classDoc);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addSession: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }

            const classSession = new ClassSessionModel(req.body);
            classDoc.class_sessions.push(classSession._id);

            await classDoc.save();
            await classSession.save();

            res.json({ message: "Session added successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while adding the session" });
        }
    },

    joinClass: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }

            const user = await UserModel.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (req.user.role === 'student') {
                if (classDoc.students.includes(req.user._id)) {
                    return res.status(403).json({ message: "Already enrolled in this class" });
                }
                classDoc.students.push(req.user._id);
                user.enrolled_classes.push(classDoc._id);
            }

            if (req.user.role === 'teacher') {
                if (classDoc.teacher_id) {
                    return res.status(403).json({ message: "This class already has a teacher" });
                }
                classDoc.teacher_id = req.user._id;
                user.assigned_classes.push(classDoc._id);
            }

            await classDoc.save();
            await user.save();

            res.json({ message: "Joined class successfully", class: classDoc });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while joining the class" });
        }
    },
    leaveClass: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class does not exist" });
            }

            const user = await UserModel.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (req.user.role === 'student') {
                if (!classDoc.students.includes(req.user._id)) {
                    return res.status(403).json({ message: "Not enrolled in this class" });
                }
                classDoc.students = classDoc.students.filter(id => id.toString() !== req.user._id.toString());
                user.enrolled_classes = user.enrolled_classes.filter(class_id => class_id.toString() !== classDoc._id.toString());
            }

            if (req.user.role === 'teacher') {
                if (!classDoc.teacher_id || classDoc.teacher_id.toString() !== req.user._id.toString()) {
                    return res.status(403).json({ message: "You are not the teacher of this class" });
                }
                classDoc.teacher_id = null;
                user.assigned_classes = user.assigned_classes.filter(class_id => class_id.toString() !== classDoc._id.toString());
            }

            await classDoc.save();
            await user.save();
            res.json({ message: "Successfully left the class" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while leaving the class" });
        }
    },
    deleteClass: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }

            await classDoc.deleteOne();
            res.json({ message: "Class deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while deleting the class" });
        }
    }
};

module.exports = classController;
