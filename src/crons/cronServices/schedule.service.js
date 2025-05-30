const ClassSessionModel = require("../../models/class_session.model");
const NotifyModel = require("../../models/notify.model");


const scheduleService = {
	getUpcomingSessionsNotifies: async () => {
		try {
			const now = new Date();
			const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

			const upcomingSessions = await ClassSessionModel.find({
				start_time: { $gte: now, $lte: thirtyMinutesFromNow },
				notified: false
			}).populate([
				{
					path: "class_id",
					select: 'students teachers'
				}
			]);

			const notifications = [];
			for (const session of upcomingSessions) {
				const notify = await NotifyModel.create({
					title: `Upcoming Session: ${session.title}`,
					content: `Your session "${session.title}" is starting soon.`,
					type: "upcoming_session",
					link: `/class/${session.class_id._id}`,
					users: [...session.class_id.students, ...session.class_id.teachers]
				})
				notifications.push(notify);
			}

			upcomingSessions.forEach(async (session) => {
				session.notified = true;
				await session.save();
			});

			return notifications;
		} catch (error) {
			console.error('Error in upcomingSessionsNotifies:', error);
			return [];
		}
	}
}

module.exports = scheduleService;