const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema({
    salary_per_hour: {
        type: Number,
        required: true
    },
    work_logs: [{
        checkin_time: Date,
        checkout_time: Date,
        work_hours: Number,
        is_paid: Boolean
    }]
})

const staffModel = mongoose.model('staff', staffSchema)

module.exports = staffModel