const User = require('./user.model')
const mongoose = require('mongoose')
const ClassModel = require('./class.model')
const CourseModel = require('./course.model')

const studentSchema = new mongoose.Schema({
    enrolled_classes: [{
        type: mongoose.Types.ObjectId,
        ref: 'classes'
    }],
    tuitions: [{
        type: mongoose.Types.ObjectId,
        ref: 'bills'
    }],
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

studentSchema.methods.addClass = async function (classId) {
    const classToAdd = await ClassModel
        .findById(classId)
        .populate('course');
    if (!classToAdd) {
        throw new Error('Class not found');
    }

    if (this.enrolled_classes.includes(classId)) {
        throw new Error('Already enrolled in this class');
    }

    const price = Number(classToAdd.course.price);
    this.outstanding_fees += price;

    this.enrolled_classes.push(classId);

    await CourseModel.findByIdAndUpdate(
        classToAdd.course._id,
        { $pull: { requested_students: this._id } }
    );

    classToAdd.students.push(this._id);


    await Promise.all([
        this.save(),
        classToAdd.save()
    ]);

    return this;
};


const StudentModel = User.discriminator('student', studentSchema)


module.exports = StudentModel