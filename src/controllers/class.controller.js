const ClassModel = require('../models/class.model');
const ClassSessionModel = require('../models/class_session.model')
const UserModel = require('../models/user.model');
const StudentModel = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Chatroom = require('../models/chatroom.model');
const { remove, path } = require('../models/comment.model');
const ClassPost = require('../models/classPost.model');
const webSocketService = require('../services/webSocket.service');
const BillModel = require('../models/bill.model');

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
            console.error("Error creating class:", error);
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
            const classes = await ClassModel.find().populate([
                {
                    path: "teachers",
                    select: "_id name avatar_url"
                },
                {
                    path: "class_sessions",
                    select: "_id start_time end_time"
                }
            ]);
            res.status(200).json(classes);
        } catch (error) {
            console.error("Get all classes error:", error);
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
            const id = req.params.id;

            const requestedFields = []
            if (typeof req.query.populate_fields === 'string') {
                requestedFields.push(req.query.populate_fields);
            } else if (Array.isArray(req.query.populate_fields)) {
                requestedFields.push(...req.query.populate_fields);
            }

            const populateFields = {
                class_posts: {
                    path: 'class_posts',
                    populate: [
                        {
                            path: 'author',
                            select: '_id name avatar_url'
                        },
                        {
                            path: 'comments.author',
                            select: '_id name avatar_url'
                        },
                        {
                            path: 'assignment',
                            select: '_id title description due_date'
                        }
                    ]
                },
                teachers: {
                    path: 'teachers',
                    select: '_id name avatar_url'
                },
                students: {
                    path: 'students',
                    select: '_id name avatar_url'
                },
                class_sessions: {
                    path: 'class_sessions',
                    select: "_id start_time end_time title description type room"
                },
                course: {
                    path: 'course',
                    select: '_id name goal course_level img_url course_programs'
                }
            };

            const populateOptions = requestedFields
                .map(field => populateFields[field])
                .filter(Boolean);

            const classDoc = await ClassModel.findById(id)
                .populate(populateOptions)
                .lean();

            if (!classDoc) {
                return res.status(404).json({ error: "Class not found" });
            }

            return res.status(200).json(classDoc);
        } catch (error) {
            console.error("Error fetching class:", error);
            return res.status(500).json({ error: "Internal Server Error" });
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
                'class_name', 'class_code',
                'max_students', 'note', 'status'
            ];
            const isValidOperation = updateFields.every(field => allowedUpdateFields.includes(field));

            if (!isValidOperation) {
                console.error("Invalid update fields:", updateFields);
                return res.status(400).json({ error: "Invalid update field" });
            }

            const classDoc = await ClassModel.findById(req.params.id);
            if (!classDoc) {
                console.error("Class not found with ID:", req.params.id);
                return res.status(404).json({ error: "Class not found" });
            }

            updateFields.forEach(field => classDoc[field] = req.body[field]);
            await classDoc.save();
            res.json(classDoc);
        } catch (error) {
            console.error("Error updating class:", error);
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
                user.enrolled_classes.push(classDoc._id);
            }

            await classDoc.save();
            await user.save();

            res.json(classDoc);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "An error occurred while joining the class" });
        }
    },
    getUserClasses: async (req, res) => {
        try {
            const user = await UserModel.findById(req.params.id).populate({
                path: 'enrolled_classes',
                match: { status: { $ne: 'finished' } },
                populate: [
                    {
                        path: 'teachers',
                        select: '_id name avatar_url'
                    },
                    {
                        path: 'course',
                        select: '_id name goal course_level img_url'
                    },
                    {
                        path: 'class_sessions',
                        select: '_id start_time end_time'
                    }
                ]
            });

            const classes = user.enrolled_classes;


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
                user.enrolled_classes = user.enrolled_classes.filter(class_id => class_id.toString() !== classDoc._id.toString());
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
    addUserToClass: async (req, res) => {
        try {
            const userIds = req.body.userIds;
            const classId = req.params.id;
            const classDoc = await ClassModel.findById(classId).populate({
                path: "course",
                select: "price"
            });
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }
            const users = await UserModel.find({ _id: { $in: userIds } });
            if (!users || users.length === 0) {
                return res.status(404).json({ message: "No users found" });
            }
            users.forEach(async (user) => {
                if (user.role === 'student') {
                    if (classDoc.students.includes(user._id)) {
                        return res.status(403).json({ message: "Already enrolled in this class" });
                    }
                    classDoc.students.push(user._id);
                    user.enrolled_classes.push(classDoc._id);
                    const bill = await BillModel.create({
                        user: user._id,
                        amount: classDoc.course.price,
                        course: classDoc.course._id,
                        status: 'pending',
                        type: 'tuition',
                    })
                    user.bills.push(bill._id);
                    await bill.save();
                } else if (user.role === 'teacher') {
                    if (classDoc.teachers.includes(user._id)) {
                        return res.status(403).json({ message: "This class already has a teacher" });
                    }
                    classDoc.teachers.push(user._id);
                    user.enrolled_classes.push(classDoc._id);
                }
                await user.save();
            })
            await classDoc.save();
            res.status(200).json("added user to class");
        } catch (error) {
            console.error("error adding teacher to class", error);
            res.status(500).json("Error adding teacher");
        }
    },

    removeUserFromClass: async (req, res) => {
        try {
            const user_id = req.query.user_id;
            const class_id = req.params.id;
            const user = await UserModel.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const classDoc = await ClassModel.findById(class_id);
            if (!classDoc) {
                return res.status(404).json({ message: "Class not found" });
            }
            user.enrolled_classes = user.enrolled_classes.filter((class_id) => class_id.toString() !== req.params.id.toString());

            await user.save();

            if (classDoc.status !== 'pending' && classDoc.status !== 'finished') {
                return res.status(403).json({ message: "Class is in progress" });
            }

            classDoc.students = classDoc.students.filter((user_id) => user_id.toString() !== req.body.user_id.toString());
            classDoc.teachers = classDoc.teachers.filter((user_id) => user_id.toString() !== req.body.user_id.toString());
            await classDoc.save();
            res.status(200).json("remove user success");
        } catch (error) {
            console.error("error removing user from class", error);
            res.status(500).json("Error removing user");
        }

    },

    addPost: async (req, res) => {
        try {
            const classId = req.params.id;
            const classObj = await ClassModel.findById(classId);
            if (!classObj) {
                return res.status(404).json({ message: "Class not found" });
            }
            const post = await ClassPost.create({
                class_id: classId,
                user_id: req.user._id,
                ...req.body
            });

            classObj.posts.push(post._id);
            await classObj.save();
            await post.save();
            webSocketService.
                res.status(200).json(post);
        } catch (error) {
            console.error("Error adding post to class", error);
            res.status(500).json({ message: "An error occurred while adding the post" });
        }
    },

    getAllClassSchedule: async (req, res) => {
        try {
            const classDocs = await ClassModel.find().populate({
                path: "class_sessions",
                select: "_id title description start_time end_time type room"
            })

            if (!classDocs) {
                return res.status(404).json({ message: "Class not found" });
            }

            const schedule = [];

            for (const classDoc of classDocs) {
                const sessions = classDoc.class_sessions.map(session => ({
                    id: session._id,
                    title: session.title,
                    description: session.description,
                    start_time: session.start_time,
                    end_time: session.end_time,
                    room: session.room,
                    type: session.type,
                    class_name: classDoc.class_name,
                    class_code: classDoc.class_code,
                }));
                schedule.push(...sessions);
            }

            res.status(200).json(schedule);

        } catch (error) {
            console.error("Error fetching class schedule:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = classController;
