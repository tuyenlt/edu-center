const ClassModel = require('../models/class.model');
const ClassSessionModel = require('../models/class_session.model')
const UserModel = require('../models/user.model');
const StudentModel = require('../models/student.model');
const Teacher = require('../models/teacher.model');

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
            const classes = await ClassModel.find().populate({
                path: "teachers",
                select: "_id name avatar_url"
            });
            res.status(200).json(classes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    /**
     * @route      GET /classes/:id
     * @access    Authenticated users
     * @role      teacher, student, manager
     *
     * @response    class object. JSON format.
     */
    getClassById: async (req, res) => {
        try {
            const { id } = req.params;

            let classDoc = await ClassModel.findById(id)
                .populate({
                    path: 'course',
                    select: 'name goal course_level img_url course_programs'
                })
                .populate({
                    path: 'teachers',
                    select: '_id name avatar_url'
                })
                .populate({
                    path: 'students',
                    select: '_id name avatar_url'
                })
                .populate({
                    path: 'class_sessions'
                });

            // const classDoc = await query.exec();

            if (!classDoc) {
                return res.status(404).json({ error: "Class not found" });
            }

            res.status(200).json(classDoc);
        } catch (error) {
            console.error("Error fetching class:", error);
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
    getCurrentUserClasses: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id);
            let userByRole = [];

            let classes = []
            if (user.role === 'student') {
                userByRole = await user.populate({
                    path: 'enrolled_classes',
                    populate: {
                        path: "teachers",
                        select: "_id name avatar_url"
                    }
                });
                classes = userByRole.enrolled_classes.filter(classDoc => classDoc.status !== 'finished');
            } else if (user.role === 'teacher') {
                userByRole = await user.populate({
                    path: 'assigned_classes',
                    populate: {
                        path: "teachers",
                        select: "_id name avatar_url"
                    }
                });
                classes = userByRole.assigned_classes.filter(classDoc => classDoc.status !== 'finished');
            }
            if (!classes) {
                return res.status(404).json({ message: "No classes found" });
            }
            res.status(200).json(classes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while fetching classes" });
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
    addTeacher: async (req, res) => {
        try {
            const teacher_id = req.body.teacher_id;
            const class_id = req.params.id;
            const teacher = await Teacher.findById(teacher_id);
            teacher.addAssignedClass(class_id);
            await teacher.save()
            res.status(200).json("add teacher success");
        } catch (error) {
            console.error("error adding teacher to class", error);
            res.status(500).json("Error adding teacher");
        }
    },

    removeTeacher: async (req, res) => {
        try {
            const teacher_id = req.body.teacher_id;
            const class_id = req.params.id;
            const teacher = await Teacher.findById(teacher_id);
            teacher.assigned_classes = teacher.assigned_classes.filter((class_id) => class_id.toString() !== req.params.id.toString());
            await teacher.save();
            const classDoc = await ClassModel.findById(class_id);
            classDoc.teachers = classDoc.teachers.filter((teacher_id) => teacher_id.toString() !== req.body.teacher_id.toString());
            await classDoc.save();
            res.status(200).json("remove teacher success");
        } catch (error) {
            console.error("error removing teacher from class", error);
            res.status(500).json("Error removing teacher");
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

            // if (classDoc.status !== 'pending' && classDoc.status !== 'scheduling') {
            //     return res.status(403).json({ message: "Cannot add students to this class" });
            // }

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

    removeStudent: async (req, res) => {
        try {
            const student_id = req.body.student_id;
            const class_id = req.params.id;
            const student = await StudentModel.findById(student_id);
            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }
            student.enrolled_classes = student.enrolled_classes.filter((class_id) => class_id.toString() !== req.params.id.toString());
            await student.save();
            const classDoc = await ClassModel.findById(class_id);
            classDoc.students = classDoc.students.filter((student_id) => student_id.toString() !== req.body.student_id.toString());
            await classDoc.save();
            res.status(200).json("remove student success");
        } catch (error) {
            console.error("error removing student from class", error);
            res.status(500).json("Error removing student");
        }
    }
};

module.exports = classController;
