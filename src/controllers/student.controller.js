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
            const students = await StudentModel.find().populate('enrolled_classes', 'name')
            res.json(students)
        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
}

module.exports = studentController