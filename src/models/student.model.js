const User = require('./user.model')
const mongoose = require('mongoose')
const ClassModel = require('./class.model')

const studentSchema = new mongoose.Schema({
    enrolled_classes: [{
        type: mongoose.Types.ObjectId,
        ref: 'classes'
    }],
    outstanding_fees: { type: Number, default: 0 },
    paid_fees: { type: Number, default: 0 },
    attended_class_sessions: [{
        type: mongoose.Types.ObjectId,
        ref: 'class_sessions'
    }],
    assignments: [{
        type: mongoose.Types.ObjectId,
        ref: "assignments"
    }],
    personal_info: {
        type: {
            dob: {
                type: Date,
                required: true
            },
            address: {
                type: String,
                required: true
            },
        }
    }
})

studentSchema.method.addClass = async function (classId) {
    try {
        const classToAdd = await ClassModel.findById(classId)
        if (!classToAdd) {
            throw new Error('Class not found')
        }

        if (this.enrolled_classes.includes(classId)) {
            throw new Error('Already enrolled in this class')
        }
        this.outstanding_fees += classToAdd.populate('course_id').price
        this.enrolled_classes.push(classId)
        classToAdd.students.push(this._id)
        await classToAdd.save()
        await this.save()
        next()
    } catch (error) {
        throw new Error(error)
    }
}


const StudentModel = User.discriminator('student', studentSchema)


module.exports = StudentModel