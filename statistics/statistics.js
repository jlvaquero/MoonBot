const EngineEvents = require('../engineEvents');
const Redis = require('ioredis');
const { partition } = require('rxjs');

function statistics(events) {

  const useStatistics = process.env.MOON_BOT_USE_REDIS && process.env.MOON_BOT_USE_STATISTICS;

  if (!useStatistics) {
    return {
      quit: () => Promise.resolve('OK')
    };
  }

  const redis = new Redis({
    port: process.env.MOON_BOT_REDIS_DB_PORT,
    host: process.env.MOON_BOT_REDIS_DB_HOST,
    password: process.env.MOON_BOT_REDIS_DB_PASSWORD
  });

  let gameStarted = null;
  let gameWon = null;
  let gameLost = null;
 
  [gameStarted, restOfEvents] = partition(events, event => event.eventType === EngineEvents.gameStarted);
  [gameWon, restOfEvents] = partition(events, event => event.eventType === EngineEvents.gameWon);
  [gameLost, restOfEvents] = partition(events, event => event.eventType === EngineEvents.gameLost);

  gameStarted.subscribe({
    next(_) {
      redis.incr('games:moon:stats:played');
    }
  });

  gameWon.subscribe({
    next(_) {
      redis.incr('games:moon:stats:won');
    }
  });

  gameLost.subscribe({
    next(_) {
      redis.incr('games:moon:stats:lost');
    }
  });

  return {
    gameStarted,
    gameWon,
    gameLost,
    quit() { return redis.quit(); }
  };

}

module.exports = statistics;