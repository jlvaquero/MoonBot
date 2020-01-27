const Redis = require('ioredis');

const redis = new Redis({
port: process.env.REDIS_DB_PORT,
host: process.env.REDIS_DB_HOST,
password: process.env.REDIS_DB_PASSWORD
});

const RedisStore = {
 set: async function (gameId, gameState) {
   return await redis.set(gameId, JSON.stringify(gameState));
  },
  get: async function (gameId) {
    return JSON.parse(await redis.get(gameId));
  },
  del: async function (gameId) {
    return await redis.del(gameId);
  }
};

module.exports = RedisStore;