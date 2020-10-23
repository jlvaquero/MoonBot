# MoonBot
![GitHub](https://img.shields.io/github/license/jlvaquero/MoonBot)
[![Build status](https://ci.appveyor.com/api/projects/status/wnv648eatjtrfsl8?svg=true)](https://ci.appveyor.com/project/jlvaquero/moonbot)
![AppVeyor tests](https://img.shields.io/appveyor/tests/jlvaquero/moonbot?style=plastic)

Bot to play [Moon (1110011)](http://compus.deusto.es/moon/) tabletop solo/cooperative in telegram.

The game engine is platform agnostic so it can be used to port the game into another platform (i.e. slack) or even build a primitive GUI for it (i.e. HTML 5)

It is in Beta. Still a lot of in-game testing is needed along with code resilence (no error controls up to date) and more unit and integration tests.

How to deploy your own moonBot:

1. Talk with @botFather in telegram and create a new bot.
2. Install https://nodejs.org
3. Download this project
4. Run "npm update --production" command in project root folder
5. Edit .env file: 

    #MOON_BOT_TOKEN=0123456789:FaKetOkEn - Mandatory. Uncomment and set the bot token given to you by @botFather.

    #MOON_BOT_USE_WEBHOOK=false - Activate telegram webhooks or use long polling
    
    #MOON_BOT_PUBLIC_URL=https://yourDomainName - Needed for bot webhook, public url to your domain
    
    #MMOON_BOT_PUBLIC_PORT=443 - Needed for bot webhook, public port to your domain
    
    #MOON_BOT_BIND_PORT = 8443 - Needed for bot webhook, port where the bot listen in the machine
    
    #MOON_BOT_BIND_HOST_IP = 0.0.0.0 - Needed for bot webhook, IP where the bot listen in the machine

    #MOON_BOT_USE_REDIS=false - Set true to use redis instead of inMemory store

    #MOON_BOT_REDIS_DB_PORT=6379 - If you want to use redis store instead of inMemoryStore (recommended)
    
    #MOON_BOT_REDIS_DB_HOST=192.168.1.1 - If you want to use redis store instead of inMemoryStore
    
    #MOON_BOT_REDIS_DB_PASSWORD=1234 - If you want to use redis store instead of inMemoryStore

    #MOON_BOT_REDIS_DATA_EXPIRE=86400 - Set sliding expiration time in redis to delete "abandoned" games

    #MOON_BOT_USE_STATISTICS=false - Set true to store statistics in redis

    #MOON_BOT_USE_RECORDER=false - Set true to store a replayable gameplay record of the games in redis
    
    More details about .env file in https://www.npmjs.com/package/dotenv
    
6. Run "npm start" in project root folder

Now you can chat with the bot to play solo or add the bot to a telegram group to play with your friends.
Write "/help" to see available bot commands. Remember that telegram bots have command intellisense configurable through @botFather.

NOTES for PRODUCTION enviroment:

  Use webhooks instead of long polling.        https://github.com/jlvaquero/MoonBot/blob/18fd86600cd0b7bf6af6b31c07b157a2834c9328/moonBot.js#L24
  
  Use memcache, redis or some fast persistence store instead of inMemory store.
  
  Use a PROCESS MANAGER like https://pm2.keymetrics.io/ to daemonize, monitor and cluster the bot.
