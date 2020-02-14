const Redis = require('ioredis');
const { CardType, GameEventType } = require('../gameRules');

const redis = new Redis({
  port: process.env.REDIS_DB_PORT,
  host: process.env.REDIS_DB_HOST,
  password: process.env.REDIS_DB_PASSWORD
});

const RedisStore = {
  async set(gameId, gameState) {
    return await redis.set(gameId, JSON.stringify(gameState), 'ex', 86400); //game will be deleted after 24h without activity
  },
  async get(gameId) {
    return JSON.parse(await redis.get(gameId));
  },
  async del(gameId) {
    return await redis.del(gameId);
  }
};

module.exports = RedisStore;