const valkey = require("redis");

const client = valkey.createClient({
    url: "redis://127.0.0.1:6379", // Update if needed
});

client.on("connect", () => console.log("Connected to Valkey"));
client.on("error", (err) => console.error("Valkey error:", err));

(async () => {
    await client.connect(); // Ensure the client is connected
})();

module.exports = client;
