const User = require('./user.model')
const mongoose = require('mongoose')
const ClassModel = require('./class.model')

const studentSchema = new mongoose.Schema({
    errolled_classes: [{
        type: mongoose.Types.ObjectId,
        ref: 'classes'
    }],
    outstanding_fees: { type: Number, default: 0 }
})

studentSchema.methods.addNewClass = async function (class_id) {
    const newClass = await ClassModel.findOne({ _id: class_id })

    if (!newClass) {
        throw new Error("class not found")
    }

    if (this.errolled_classes.includes(newClass._id)) {
        throw new Error("Student is already enrolled in this class");
    }

    this.errolled_classes.push(newClass._id)
    newClass.students.push({
        student_id: this._id,
        join_at: new Date()
    })

    await this.save()
    await newClass.save()
}

const Student = User.discriminator('student', studentSchema)


module.exports = Student