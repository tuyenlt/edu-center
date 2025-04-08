const redis = require('redis');

const valkeyHost = process.env.VALKEY_HOST || '127.0.0.1';
const valkeyPort = process.env.VALKEY_PORT || 6379;

const client = redis.createClient({
    socket: {
        host: valkeyHost,
        port: valkeyPort,
    },
});

client.connect();

client.on('connect', () => {
    console.log(`Connected to Valkey at ${valkeyHost}:${valkeyPort}`);
});

client.on('error', (err) => {
    console.error('Error connecting to Valkey:', err);
});

module.exports = client;
