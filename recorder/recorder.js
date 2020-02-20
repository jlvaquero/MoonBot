const Redis = require('ioredis');

function recorder(commands) {

  const useRecorder = process.env.MOON_BOT_USE_REDIS && process.env.MOON_BOT_USE_RECORDER;

  if (!useRecorder) {
    return {
      quit: () => Promise.resolve('OK')
    };
  }

  const redis = new Redis({
    port: process.env.MOON_BOT_REDIS_DB_PORT,
    host: process.env.MOON_BOT_REDIS_DB_HOST,
    password: process.env.MOON_BOT_REDIS_DB_PASSWORD
  });

  commands.subscribe({
    next(command) {
      redis.rpush(`games:moon:records:${command.gameUUID}`, JSON.stringify(command));
    }
  });

  return {
    commands,
    quit() { return redis.quit(); }
  };
}

module.exports = recorder;