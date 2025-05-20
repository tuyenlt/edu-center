const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema({
    onMessaging: [{
        type: mongoose.Types.ObjectId,
        ref: 'student'
    }],
})

const staffModel = mongoose.model('staff', staffSchema)

module.exports = staffModel