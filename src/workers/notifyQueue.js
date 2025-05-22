const { Queue } = require('bullmq');
const valkeyConnection = require('../configs/valkey');

const notifyQueue = new Queue('notify', { valkeyConnection });

module.exports = notifyQueue;