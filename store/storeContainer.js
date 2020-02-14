const use_redis = process.env.MOON_BOT_USE_REDIS;

if (use_redis) {
  Store = require('./redisStore'); //redis store recommended for production
}
else {
  Store = require('./memoryStore'); //memory store for testing and develop
}

module.exports = Store;