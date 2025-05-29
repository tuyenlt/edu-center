const ClassSessionModel = require('../models/class_session.model');

const classSessionController = {
	createClassSession: async (req, res) => {
		try {
			const newClassSession = new ClassSessionModel(req.body);
			await newClassSession.save();
			res.status(201).json(newClassSession);
		} catch (error) {
			console.error("Error creating class session:", error);
			res.status(500).json({ error: error.message });
		}
	},
	getAllClassSessions: async (req, res) => {
		try {
			const classSessions = await ClassSessionModel.find();
			res.status(200).json(classSessions);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},
	getClassSessionById: async (req, res) => {
		try {
			const classSession = await ClassSessionModel.findById(req.params.id);
			if (!classSession) {
				return res.status(404).json({ message: "Class session not found" });
			}
			res.status(200).json(classSession);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},
	editClassSession: async (req, res) => {
		try {
			const classSessionId = req.params.id;
			const updateData = req.body;

			const session = await ClassSessionModel.findById(classSessionId);

			Object.keys(updateData).forEach(key => {
				if (updateData[key] !== undefined) {
					session[key] = updateData[key];
				}
			});

			await session.save();

			return res.status(200).json({
				message: 'Class session updated successfully',
				data: session
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error', error });
		}
	},
	deleteClassSession: async (req, res) => {
		try {
			const classSessionId = req.params.id;

			const deletedClassSession = await ClassSessionModel.findByIdAndDelete(classSessionId);

			if (!deletedClassSession) {
				return res.status(404).json({ message: 'Class session not found' });
			}

			return res.status(200).json({
				message: 'Class session deleted successfully',
				data: deletedClassSession
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error', error });
		}
	},
	addAttendance: async (req, res) => {
		try {
			const sessionId = req.params.id;
			const { userIds } = req.body;

			const classSession = await ClassSessionModel.findById(sessionId);

			if (!classSession) {
				return res.status(404).json({ message: "Class session not found" });
			}

			classSession.attendance = userIds ? userIds : classSession.attendance;
			await classSession.save();

			return res.status(200).json(classSession);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error', error });
		}
	},
	removeAttendance: async (req, res) => {
		try {
			const sessionId = req.params.id;
			const { userId } = req.body;

			const classSession = await ClassSessionModel.findById(sessionId);

			if (!classSession) {
				return res.status(404).json({ message: "Class session not found" });
			}

			classSession.attendance = classSession.attendance.filter(id => id.toString() !== userId);
			await classSession.save();

			return res.status(200).json({
				message: 'Attendance removed successfully',
				data: classSession
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: 'Server error', error });
		}
	}
}

module.exports = classSessionController;