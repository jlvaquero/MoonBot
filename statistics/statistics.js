const EngineEvents = require('../engineEvents');
const Redis = require('ioredis');
const { partition } = require('rxjs');

const redis = new Redis({
  port: process.env.REDIS_DB_PORT,
  host: process.env.REDIS_DB_HOST,
  password: process.env.REDIS_DB_PASSWORD
});


function statistics(events) {

  const useStatistics = process.env.MOON_BOT_USE_REDIS && process.env.MOON_BOT_USE_STATISTICS;

  if (!useStatistics) { return null; }

  let gameStarted = null;
  let gameWon = null;
  let gameLost = null;
  let gameCancelled = null;

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

}

module.exports = statistics;