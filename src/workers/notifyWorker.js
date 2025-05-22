const { Worker, QueueScheduler } = require('bullmq');

const valkeyConnection = require('../configs/valkey');
const webSocketService = require('../services/webSocket.service');

new QueueScheduler('notify', { valkeyConnection });

const notifyWorker = new Worker('notify', async (job) => {
    switch (job.name) {
        case 'notify':
            const notifyModel = job.data;
            await notifyModel.save();

            for (const userId of notifyModel.users) {
                webSocketService.sendUserNotification(userId, {
                    title: notifyModel.title,
                    content: notifyModel.content,
                    link: notifyModel.link,
                    createdAt: notifyModel.createdAt
                });
            }
            break;
        default:
            console.log('Unknown job name:', job.name);
    }


})

notifyWorker.on('completed', job => {
    console.log(`Job ${job.id} (${job.name}) completed.`);
});

notifyWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});