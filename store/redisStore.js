const Redis = require('ioredis');

const redis = new Redis({
  port: process.env.MOON_BOT_REDIS_DB_PORT,
  host: process.env.MOON_BOT_REDIS_DB_HOST,
  password: process.env.MOON_BOT_REDIS_DB_PASSWORD
});

const expireTime = process.env.MOON_BOT_REDIS_DATA_EXPIRE;

const RedisStore = {
  async set(gameId, gameState) {
    return await redis.set(`games:moon:${gameId}`, JSON.stringify(gameState), 'ex', expireTime); //game will be deleted after expireTime without activity
  },
  async get(gameId) {
    return JSON.parse(await redis.get(`games:moon:${gameId}`));
  },
  async del(gameId) {
    return await redis.del(`games:moon:${gameId}`);
  },
  async quit() {
    return await redis.quit();
  }
};

module.exports = RedisStore;