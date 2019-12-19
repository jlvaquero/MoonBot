const TelegramBot = require('node-telegram-bot-api');
//const Store = require('ioredis');
//const redis = new Redis(6379, process.env.IP);
/*const redis = new Redis({
port: process.env.REDIS_DB_PORT,
host: process.env.REDIS_DB_HOST,
password: process.env.REDIS_DB_PASSWORD
});*/

const FakeStore = {
  games: new Map(),
  set: async function (gameId, gameState) {
    this.games.set(gameId, gameState);
    return Promise.resolve(gameState.id);
  },
  get: async function (gameId) {
    return Promise.resolve(this.games.get(gameId));
  },
  del: async function (gameId) {
    return Promise.resolve(this.games.delete(gameId));
  }
};

const Game = require('./moonGame')(FakeStore);

const Operation = {
  inc: "inc",
  dec: "dec",
  rol: "rol",
  ror: "ror",
  mov: "mov",
  not: "not",
  or: "or",
  and: "and",
  xor: "xor"
};

const token = () => process.env.MOON_BOT_TOKEN;
const bot = new TelegramBot(token(), {
  polling: true
});
/*var bot = new TelegramBot(token, {
 webHook: {
  port: port,
  host: host
 }
});*/
/*bot.setWebHook(externalUrl + ':443/bot' + token);*/

bot.onText(/\/start$/, InitConversationRequest);
bot.onText(/\/creategame$/, CreateGameRequest);
bot.onText(/\/joingame$/, JoinGameRequest);
bot.onText(/\/leavegame$/, LeaveGameRequest);
bot.onText(/\/startgame$/, StartGameRequest);
bot.onText(/\/status$/, StatusGameRequest);
bot.onText(/\/endturn$/, EndTurnRequest);
bot.onText(/\/cancelgame$/, CancellGameRequest);

async function InitConversationRequest(msg) {
  bot.sendMessage(msg.chat.id, `Hello ${msg.from.username}. If you want to play moon (1110011) with your friends add me to a telegram group.`);
}

async function CreateGameRequest(msg) {
  let result = await Game.CreateGame(msg.chat.id, 4, msg.from.username);
  bot.sendMessage(msg.chat.id, result);
}

async function JoinGameRequest(msg) {
  let result = await Game.JoinGame(msg.chat.id, msg.from.username);
  bot.sendMessage(msg.chat.id, result);
}

async function LeaveGameRequest(msg) {
  let resutl = await Game.LeaveGame(msg.chat.id, msg.from.username);
  bot.sendMessage(msg.chat.id, resutl);
}

async function StartGameRequest(msg) {
  let { message, gameState } = await Game.StartGame(msg.chat.id);
  //TODO: build message for player turn, current objetive, register state 
  bot.sendMessage(msg.chat.id, message);
}

async function StatusGameRequest(msg) {
  let { message, gameState } = await Game.StatusGame(msg.chat.id);
  if (message) {
    bot.sendMessage(msg.chat.id, message);
    return;
  }
  bot.sendMessage(msg.chat.id, JSON.stringify(gameState, null, 2));
}

async function EndTurnRequest(msg) {
  let { message, gameState } = await Game.EndPlayerTurn(msg.chat.id, msg.from.username);
  //TODO: build message for player turn
  bot.sendMessage(msg.chat.id, message);
}

async function CancellGameRequest(msg) {
  let result = await Game.CancelGame(msg.chat.id);
  bot.sendMessage(msg.chat.id, result);
}

async function Inc(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.inc, register);
  bot.sendMessage(msg.chat.id, result);
}
async function Dec(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.dec, register);
  bot.sendMessage(msg.chat.id, result);
}
async function Rol(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.rol, register);
  bot.sendMessage(msg.chat.id, result);
}
async function Ror(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.ror, register);
  bot.sendMessage(msg.chat.id, result);
}
async function Mov(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.mov, register1, register2);
  bot.sendMessage(msg.chat.id, result);
}
async function Not(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.not, register);
  bot.sendMessage(msg.chat.id, result);
}
async function Or(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.or, register1, register2);
  bot.sendMessage(msg.chat.id, result);
}
async function And(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.and, register1, register2);
  bot.sendMessage(msg.chat.id, result);
}
async function Xor(msg) {
  Game.ExecuteBitOperation(msg.chat.id, msg.from.username, Operation.xor, register1, register2);
  bot.sendMessage(msg.chat.id, result);
}