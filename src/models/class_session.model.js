const mongoose = require('mongoose');
const ClassModel = require('./class.model');

const classSessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    chapter_index: {
        type: Number,
        required: true,
        min: 0
    },
    lecture_index: {
        type: Number,
        required: true,
        min: 0
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'classes',
        required: true
    },
    room: {
        type: String,
        required: true,
    }
    ,
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teachers',
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    },
    attendance: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
}, { timestamps: true, collection: "class_sessions" });

classSessionSchema.pre('save', async function (next) {
    const classDoc = await ClassModel.findById(this.class_id);
    if (classDoc) {
        // Check if the session already exists in the class
        if (classDoc.class_sessions.includes(this._id)) {
            return next();
        }
        console.log("Adding class session to class:", this._id);
        classDoc.class_sessions.push(this._id);
        await classDoc.save();
    }
    next();
})

classSessionSchema.pre('deleteOne', async function (next) {
    const classDoc = await ClassModel.findById(this.class_id)
    classDoc.class_sessions = classDoc.class_sessions.filter(session_id => session_id != this._id)
    await classDoc.save();
    next();
})

const ClassSessionModel = mongoose.model('class_sessions', classSessionSchema);
module.exports = ClassSessionModel;
