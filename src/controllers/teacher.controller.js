const BillModel = require('../models/bill.model');
const ClassSessionModel = require('../models/class_session.model');
const Teacher = require('../models/teacher.model');
const { getHourBetween } = require('../utils');

const teacherController = {
	getTeacherList: async (req, res) => {
		try {
			const teachers = await Teacher.find().populate([
				{
					path: "enrolled_classes",

				}
			]);
			res.json(teachers);
		} catch (error) {
			console.error("Error fetching teacher list:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	},
	addAttendedSession: async (req, res) => {
		try {
			const teacherId = req.params.id;
			const sessionId = req.body.sessionId;

			const teacher = await Teacher.findById(teacherId);
			if (!teacher) {
				return res.status(404).json({ message: "Teacher not found" });
			}

			for (const session of teacher.attended_class_sessions) {
				if (session.class_session.toString() === sessionId) {
					return res.status(400).json({ message: "Session already added" });
				}
			}

			const session = await ClassSessionModel.findById(sessionId);
			session.attendance.push(teacherId);

			const bill = await BillModel.create({
				user: teacherId,
				amount: teacher.hourly_wage * getHourBetween(session.start_time, session.end_time),
				status: "unpaid",
				session: sessionId,
				type: "salary"
			})

			await bill.save();

			teacher.bills.push(bill._id);


			teacher.attended_class_sessions.push({
				class_session: sessionId,
				is_paid: false
			});
			await teacher.save();

			res.status(200).json({ message: "Session added successfully", teacher });
		} catch (error) {
			console.error("Error adding attended session:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
}

module.exports = teacherController;    