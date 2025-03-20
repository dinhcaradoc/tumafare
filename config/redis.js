const Redis = require('redis');

// Create Redis client
const redisClient = Redis.createClient();

// Log errors
redisClient.on('error', err => console.error('Redis Client Error:', err));

// Log connection status
redisClient.on('connect', () => console.log('Connected to Redis'));

// Ensure the Redis client connects properly
(async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

// Gracefully handle shutdown
process.on('SIGINT', async () => {
  try {
    await redisClient.quit();
    console.log('Redis client disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Failed to disconnect Redis client:', err);
    process.exit(1);
  }
});

module.exports = redisClient;