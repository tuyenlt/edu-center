const User = require('../models/user.model');

const userScheduleService = {
	getUserSchcedule: async (userId) => {
		try {
			const user = await User.findById(userId).populate([
				{
					path: 'enrolled_classes',
					select: 'class_sessions',
					populate: {
						path: 'class_sessions',
						select: 'start_time end_time'
					}
				}
			]);
			if (!user) {
				throw new Error('User not found');
			}

			const sessions = user.enrolled_classes.flatMap(cls => cls.class_sessions);
			return sessions;
		} catch (error) {
			throw new Error(`Error fetching user schedule: ${error.message}`);
		}
	},
	checkConflictSchedule: async (userId, sessions) => {
		try {
			const userSessions = await userScheduleService.getUserSchcedule(userId);
			if (!userSessions || userSessions.length === 0) {
				return false; // No existing sessions, no conflict
			}
			// Check for conflicts
			for (const newSession of sessions) {
				const newStart = new Date(newSession.start_time);
				const newEnd = new Date(newSession.end_time);

				for (const existingSession of userSessions) {
					const existingStart = new Date(existingSession.start_time);
					const existingEnd = new Date(existingSession.end_time);

					// Check if the new session overlaps with any existing session
					if (
						(newStart < existingEnd && newEnd > existingStart)
					) {
						return true; // Conflict found
					}
				}
			}
			return false; // No conflicts found
		} catch (error) {
			throw new Error(`Error checking conflict schedule: ${error.message}`);
		}
	}
}

module.exports = userScheduleService;