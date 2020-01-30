# MoonBot
Bot to play Moon (1110011) tabletop solo/cooperative in telegram.

The game engine is platform agnostic so it can be used to port the game into another platform (i.e. slack) or even build a primitive GUI for it (i.e. HTML 5)

It is in Beta. Still a lot of in-game testing is needed along with code resilence (no error controls up to date) and unit and integration tests.

Good news!!! The game creator, Pablo Garaizar, and Deusto LearningLab have offered to host a Moon Telegram Bot. We are working on bring it up right now. Just be patient.

How to deploy your own moonBot:

1. Talk with @botFather in telegram and create a new bot.
2. Install https://nodejs.org
3. Download this project
4. Run "npm update --production" command in project root folder
5. Edit .env file: 

    #MOON_BOT_TOKEN=0123456789:FaKetOkEn - Mandatory. Uncomment and set the bot token given to you by @botFather.
    
    #MOON_BOT_PUBLIC_URL=https://yourDomainName - Needed for bot webhook
    
    #MOON_BOT_PORT=443 - Needed for bot webhook
    
    #REDIS_DB_PORT=6379 - If you want to use redis store instead of inMemoryStore (recommended)
    
    #REDIS_DB_HOST=192.168.1.1 - If you want to use redis store instead of inMemoryStore
    
    #REDIS_DB_PASSWORD=1234 - If you want to use redis store instead of inMemoryStore
    
    More details about .env file in https://www.npmjs.com/package/dotenv
    
6. Run "npm start" in project root folder

Now you can chat with the bot to play solo or add the bot to a telegram group to play with your friends.
Write "/help" to see available bot commands. Remember that telegram bots have command intellisense configurable through @botFather.

NOTES for PRODUCTION enviroment:

  Use webhooks instead of long polling.        https://github.com/jlvaquero/MoonBot/blob/18fd86600cd0b7bf6af6b31c07b157a2834c9328/moonBot.js#L24
  
  Use memcache, redis or some fast persistence store instead of inMemory store.
  
  Use a PROCESS MANAGER like https://pm2.keymetrics.io/ to daemonize, monitor and cluster the bot.
