const Redis = require('ioredis');

const valkeyHost = process.env.VALKEY_HOST || 'valkey'; // use 'valkey' for Docker service
const valkeyPort = parseInt(process.env.VALKEY_PORT || '6379', 10);

const client = new Redis({
    host: valkeyHost,
    port: valkeyPort,
});

client.on('connect', () => {
    console.log(`✅ Connected to Valkey at ${valkeyHost}:${valkeyPort}`);
});

client.on('error', (err) => {
    console.error('❌ Error connecting to Valkey:', err);
});

(async () => {
    try {
        await client.set('test-key', 'hello');
        const value = await client.get('test-key');
        console.log('📦 Got value:', value);
    } catch (err) {
        console.error('❌ Redis command failed:', err);
    }
})();

module.exports = client;
