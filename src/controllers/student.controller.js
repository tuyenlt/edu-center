const StudentModel = require('../models/student.model')


const studentController = {
    getEnrolledClasses: async (req, res) => {
        try {
            const student = await StudentModel.findById(req.params.id)

            if (!student) {
                res.status(404).json({ error: "Student not found" })
            }

            const enrolledClasses = await student.populate({
                path: "enrolled_classes",
                select: "_id name"
            })

            res.json(enrolledClasses)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
    getAllStudents: async (req, res) => {
        try {
            const students = await StudentModel.find().populate({
                path: "enrolled_classes",
                select: "class_name class_code",
            })
            res.json(students)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
    getStudentSchedules: async (req, res) => {
        try {
            const student = await StudentModel.findById(req.params.id).populate({
                path: "enrolled_classes",
                select: "class_sessions class_name",
                populate: [
                    {
                        path: "class_sessions",
                        select: "_id start_time end_time title room ",
                    },
                ]
            });
            if (!student) {
                return res.status(404).json({ error: "Student not found" });
            }
            const schedules = student.enrolled_classes.map((classItem) => {
                return classItem.class_sessions.map((session) => {
                    return {
                        class_name: classItem.class_name,
                        ...session._doc,
                    };
                });
            });
            res.json(schedules.flat());
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: error })
        }
    }
}

module.exports = studentController