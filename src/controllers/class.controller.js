const ClassModel = require('../models/class.model');
const ClassSessionModel = require('../models/class_session.model')
const UserModel = require('../models/user.model');
const StudentModel = require('../models/student.model');

const classController = {
    /**
     * @route      POST /classes
     * @access     Manager
     * @description Create a new class. The request body should contain the fields in the class model.:
     * @response    new class object. JSON format.
     */
    createClass: async (req, res) => {
        try {
            const newClass = new ClassModel(req.body);
            await newClass.save();
            res.status(200).json(newClass);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Get a list of all classes in the system.
     * 
     * @route       GET /classes
     * @access     Authenticated users
     * @description Retrieves all classes available in the system.
     *              This endpoint does not require authentication.
     * @response    An array of class objects. JSON format.
     * 
     */
    getAllClasses: async (req, res) => {
        try {
            const classes = await ClassModel.find();
            res.status(200).json(classes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    /**
     * @route      GET /classes/:id
     * @access    Authenticated users
     * @role      teacher, student, manager
     * @description Get a class by ID. populate the class with the following fields:
     *              - course_id
     *              - teacher_id
     *              - students
     *              - class_sessions
     *              - assignments
     * @response    class object. JSON format.
     */
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
    /**
     * @route      PATCH /classes/:id
     * @access    Manager
     * @description Update a class by ID. The request body should contain the fields to be updated.
     * @response    updated class object. JSON format.
     * 
     */
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
    /**
     * @route      POST /classes/:id/add-session
     * @access    Manager
     * @description Add a new session to a class. The request body should contain the fields in the class session model.
     * @response    new class session object. Success message.
     * 
     */
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

            res.json({
                message: "Session added successfully"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while adding the session" });
        }
    },
    /**
     * @route      POST /classes/:id/join
     * @access    Authenticated users
     * @role      teacher, student
     * @description Join a class. The request body should contain the fields in the class model.
     * @response    updated class object. JSON format.
     */
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
                if (classDoc.teachers.includes(req.user._id)) {
                    return res.status(403).json({ message: "This class already has a teacher" });
                }
                classDoc.teachers.push(req.user._id);
                user.assigned_classes.push(classDoc._id);
            }

            await classDoc.save();
            await user.save();

            res.json(classDoc);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while joining the class" });
        }
    },
    /**
     * @route      DELETE /classes/:id/leave
     * @access    Authenticated users
     * @role       teacher, student
     * @note       participants can leave a class if the class status is "pending"
     * @response    success message
     */
    leaveClass: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class does not exist" });
            }

            if (classDoc.status !== 'pending') {
                return res.status(403).json({ message: "You cannot leave this class" });
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
    /**
     * @route      DELETE /classes/:id
     * @description just delete the class if the class status is "pending" or "fished"
     * @response    success message
     */
    deleteClass: async (req, res) => {
        try {
            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }

            if (classDoc.status !== 'pending' && classDoc.status !== 'finished') {
                return res.status(403).json({ message: "You cannot delete this class" });
            }

            await classDoc.deleteOne();
            res.json({ message: "Class deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while deleting the class" });
        }
    },
    /**
     * @route      POST /classes/:id/add-student
     * @access    Manager
     * @description Add students to a class. Class status must be "pending" or "scheduling".
     *                 The request body should contain an array of student IDs.   
     * @response   updated class object. JSON format.
     */
    addStudent: async (req, res) => {
        try {
            if (!req.body.students || !Array.isArray(req.body.students)) {
                return res.status(400).json({ message: "Invalid student IDs" });
            }

            const classId = req.params.id;

            const classDoc = await ClassModel.findById(classId);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }

            if (classDoc.status !== 'pending' && classDoc.status !== 'scheduling') {
                return res.status(403).json({ message: "Cannot add students to this class" });
            }

            const students = req.body.students;

            students.forEach(async (studentId) => {
                const student = await StudentModel.findById(studentId);
                if (!student) {
                    return res.status(404).json({ message: `Student with ID ${studentId} not found` });
                }
                await student.addClass(req.params.id);
                await student.save();
            })
            res.status(200).json(classDoc);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while adding the student" });
        }
    },
};

module.exports = classController;
