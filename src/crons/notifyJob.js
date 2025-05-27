const cron = require('node-cron');
const scheduleService = require('./cronServices/schedule.service');
const webSocketService = require('../services/webSocket.service');



cron.schedule('* * * * *', async () => {
    try {
        const notifications = await scheduleService.getUpcomingSessionsNotifies();
        if (notifications.length > 0) {
            for (const notify of notifications) {
                const users = notify.users;
                for (const user of users) {
                    webSocketService.sendNotificationToUser(user, notify);
                }
            }
            console.log('Notifications sent:', notifications);
        } else {
            console.log('No notifications to send at this time.');
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

module.exports = cron;