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

bot.onText(/^\/start$/, InitConversationRequest);
bot.onText(/^\/creategame$/, CreateDefaultGameRequest);
bot.onText(/^\/creategame ([4-6])$/, CreateGameRequest);
bot.onText(/^\/joingame$/, JoinGameRequest);
bot.onText(/^\/leavegame$/, LeaveGameRequest);
bot.onText(/^\/startgame$/, StartGameRequest);
bot.onText(/^\/status$/, StatusGameRequest);
bot.onText(/^\/endturn$/, EndTurnRequest);
bot.onText(/^\/cancelgame$/, CancellGameRequest);
bot.onText(/^\/inc ([A-D]|[a-d])$/, IncRequest);
bot.onText(/^\/dec ([A-D]|[a-d])$/, DecRequest);
bot.onText(/^\/rol ([A-D]|[a-d])$/, RolRequest);
bot.onText(/^\/ror ([A-D]|[a-d])$/, RorRequest);
bot.onText(/^\/mov ([A-D]|[a-d]) ([A-D]|[a-d])$/, MovRequest);
bot.onText(/^\/not ([A-D]|[a-d])$/, NotRequest);
bot.onText(/^\/or ([A-D]|[a-d]) ([A-D]|[a-d])$/, OrRequest);
bot.onText(/^\/and ([A-D]|[a-d]) ([A-D]|[a-d])$/, AndRequest);
bot.onText(/^\/xor ([A-D]|[a-d]) ([A-D]|[a-d])$/, XorRequest);


async function InitConversationRequest(msg) {
  bot.sendMessage(msg.chat.id, `Hello ${msg.from.username}. If you want to play moon (1110011) with your friends add me to a telegram group.`);
}

async function CreateDefaultGameRequest(msg) {
  let result = await Game.CreateGame(msg.chat.id, 4, msg.from.username);
  await sendMessage(msg.chat.id, result);
}

async function CreateGameRequest(msg, match) {
  let result = await Game.CreateGame(msg.chat.id, match[1], msg.from.username);
  await sendMessage(msg.chat.id, result);
}

async function JoinGameRequest(msg) {
  let result = await Game.JoinGame(msg.chat.id, msg.from.username);
  await sendMessage(msg.chat.id, result);
}

async function LeaveGameRequest(msg) {
  let result = await Game.LeaveGame(msg.chat.id, msg.from.username);
  await sendMessage(msg.chat.id, result);
}

async function StartGameRequest(msg) {
  let { message, gameState } = await Game.StartGame(msg.chat.id);
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function StatusGameRequest(msg) {
  let { message, gameState } = await Game.StatusGame(msg.chat.id);
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function EndTurnRequest(msg) {
  let { message, gameState } = await Game.EndPlayerTurn(msg.chat.id, msg.from.username);
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function CancellGameRequest(msg) {
  let result = await Game.CancelGame(msg.chat.id);
  await sendMessage(msg.chat.id, result);
}

const OperationCode = {
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

const ExecuteIncOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.inc);
const ExecuteDecOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.dec);
const ExecuteRolOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.rol);
const ExecuteRorOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.ror);
const ExecuteMovOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.mov);
const ExecuteNotOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.not);
const ExecuteOrOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.or);
const ExecuteAndOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.and);
const ExecuteXorOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.xor);

async function IncRequest(msg, match) {
  let { message, gameState } = await ExecuteIncOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function DecRequest(msg, match) {
  let { message, gameState } = await ExecuteDecOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function RolRequest(msg, match) {
  let { message, gameState } = await ExecuteRolOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function RorRequest(msg, match) {
  let { message, gameState } = await ExecuteRorOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function MovRequest(msg, match) {
  let { message, gameState } = await ExecuteMovOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}
async function NotRequest(msg, match) {
  let { message, gameState } = await ExecuteNotOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function OrRequest(msg, match) {
  let { message, gameState } = await ExecuteOrOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function AndRequest(msg, match) {
  let { message, gameState } = await ExecuteAndOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

async function XorRequest(msg, match) {
  let { message, gameState } = await ExecuteXorOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessage(msg.chat.id, message);
  sendGameStatus(msg.chat.id, gameState);
}

function buildStatusMessage(gameState) {

  if (!gameState) { return null; }

  const playerTurn = () => gameState.playerList[gameState.playerTurn].name;
  const eneryLeft = () => gameState.playerList[gameState.playerTurn].energy;
  const currentObjetive = () => gameState.objetives[gameState.objetives.length - 1].toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerA = () => gameState.registers.A.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerB = () => gameState.registers.B.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerC = () => gameState.registers.C.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerD = () => gameState.registers.D.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const objetivesLeft = () => gameState.objetives.length;
  const unresolved = () => gameState.unresolved;

  let statusString = `Player turn: ${playerTurn()}\n`;
  statusString += `Energy left: ${eneryLeft()}\n`;
  statusString += `Objetive: \n\n    ${currentObjetive()}\n`;
  //statusString += "Registers state\n";
  statusString += "-----------------\n";
  statusString += `A: ${registerA()}\n`;
  statusString += "-----------------\n";
  statusString += `B: ${registerB()}\n`;
  statusString += "-----------------\n";
  statusString += `C: ${registerC()}\n`;
  statusString += "-----------------\n";
  statusString += `D: ${registerD()}\n`;
  statusString += "-----------------\n";
  statusString += `Unresolved objetives: ${unresolved()}\n`;
  statusString += `Objetives left: ${objetivesLeft()}`;

  return statusString;
}

function sendMessage(chatId, message) {
  if (!message) { return Promise.resolve(); }
  return bot.sendMessage(chatId, message);
}

function sendGameStatus(chatId, gameState) {
  if (!gameState) { return Promise.resolve(); }
  return bot.sendMessage(chatId, buildStatusMessage(gameState));
}
