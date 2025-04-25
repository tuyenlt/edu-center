const mongoose = require('mongoose');
const ClassModel = require('./class.model');

const classSessionSchema = new mongoose.Schema({
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
    attendance: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }]
}, { timestamps: true, collection: "class_sessions" });

classSessionSchema.pre('deleteOne', async function (next) {
    const classDoc = await ClassModel.findById(this.class_id)
    classDoc.class_sessions = classDoc.class_sessions.filter(session_id => session_id != this._id)
})

const ClassSessionModel = mongoose.model('class_sessions', classSessionSchema);
module.exports = ClassSessionModel;
