const User = require('../models/user.model')
const Student = require('../models/student.model')
const Teacher = require('../models/teacher.model')

const getModelByRole = (role) => {
    if (role === "student") {
        return Student
    }

    if (role === "teacher") {
        return Teacher
    }

    return User
}

module.exports = getModelByRole