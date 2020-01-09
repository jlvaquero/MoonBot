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

const GameEvents = require('./gameEvents');
const { telegramEventMessages } = require('./eventMessages');
const { OperationCode } = require('./gameRules');
const { sprintf } = require('sprintf-js');

bot.onText(/^\/start$/, InitConversationRequest);
bot.onText(/^\/creategame$/, CreateDefaultGameRequest);
bot.onText(/^\/creategame ([4-6])$/, CreateGameRequest);
bot.onText(/^\/joingame$/, JoinGameRequest);
bot.onText(/^\/leavegame$/, LeaveGameRequest);
bot.onText(/^\/startgame$/, StartGameRequest);
bot.onText(/^\/status$/, StatusGameRequest);
bot.onText(/^\/endturn$/, EndTurnRequest);
bot.onText(/^\/cancelgame$/, CancellGameRequest);
bot.onText(/^\/help$/, HelpRequest);
bot.onText(/^\/rules$/, RulesRequest);
bot.onText(/^\/operations$/, OperationListRequest);
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
  bot.sendMessage(msg.chat.id, welcome_message(msg));
}

async function CreateDefaultGameRequest(msg) {
  let { events } = await Game.CreateGame(msg.chat.id, 4, msg.from.username);
  sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
}

async function CreateGameRequest(msg, match) {
  let { events } = await Game.CreateGame(msg.chat.id, match[1], msg.from.username);
  sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
}

async function JoinGameRequest(msg) {
  let { events } = await Game.JoinGame(msg.chat.id, msg.from.username);
  sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
}

async function LeaveGameRequest(msg) {
  let { events } = await Game.LeaveGame(msg.chat.id, msg.from.username);
  sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
}

async function StartGameRequest(msg) {
  let { events, gameState } = await Game.StartGame(msg.chat.id, msg.from.username);
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function StatusGameRequest(msg) {
  let { events, gameState } = await Game.StatusGame(msg.chat.id);
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function EndTurnRequest(msg) {
  let { events, gameState } = await Game.EndPlayerTurn(msg.chat.id, msg.from.username);
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function CancellGameRequest(msg) {
  let { events } = await Game.CancelGame(msg.chat.id);
  sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
}

function HelpRequest(msg) {
  sendMessage(msg.from.username, msg.chat.id, help_message);
}

function RulesRequest(msg) {
  sendMessage(msg.from.username, msg.chat.id, rules_message);
}

function OperationListRequest(msg) {
  sendMessage(msg.from.username, msg.chat.id, opList_message);
}

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
  const { events, gameState } = await ExecuteIncOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function DecRequest(msg, match) {
  const { events, gameState } = await ExecuteDecOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function RolRequest(msg, match) {
  const { events, gameState } = await ExecuteRolOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function RorRequest(msg, match) {
  const { events, gameState } = await ExecuteRorOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function MovRequest(msg, match) {
  const { events, gameState } = await ExecuteMovOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}
async function NotRequest(msg, match) {
  const { events, gameState } = await ExecuteNotOperation(msg.chat.id, msg.from.username, match[1].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function OrRequest(msg, match) {
  const { events, gameState } = await ExecuteOrOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function AndRequest(msg, match) {
  const { events, gameState } = await ExecuteAndOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
  sendGameStatus(msg.chat.id, gameState);
}

async function XorRequest(msg, match) {
  const { events, gameState } = await ExecuteXorOperation(msg.chat.id, msg.from.username, match[1].toUpperCase(), match[2].toUpperCase());
  await sendMessages(msg.chat.id, msg.from.username, events.map(eventToMesagge));
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

  return `\`\`\`
\u{1F5A5}
$> \u{1F468}\u{200D}\u{1F680} turn: ${playerTurn()}
$> ${eneryLeft()} \u{1F50B} left
$> Objetive:

-> ${currentObjetive()}
-----------------
A: ${registerA()}
-----------------
B: ${registerB()}
-----------------
C: ${registerC()}
-----------------
D: ${registerD()}
-----------------

$> Unresolved objetives: ${unresolved()}
$> Objetives left: ${objetivesLeft()}
$> man\`\`\` /operations`;

}

function eventToMesagge(event) {
  if (event === GameEvents.gameStatusConsulted) { return null; }
  else { return telegramEventMessages[event]; }
}

async function sendMessages(chatId, playerId, messages) {

  const sender = sendMessage.bind(undefined, playerId);

  for (let message of messages) {
    await sender(chatId, message);
  }
}

function sendMessage(playerId, chatId, message) {
  if (!message) { return Promise.resolve(); }
  return bot.sendMessage(chatId, sprintf(message, playerId), { parse_mode: "Markdown" });
}

function sendGameStatus(chatId, gameState) {
  if (!gameState) { return Promise.resolve(); }
  sendMessage(undefined, chatId, buildStatusMessage(gameState));
}

function welcome_message(msg) {
  return `Hello ${msg.from.username}.
You can check the /rules or /creategame and start playing in solo mode.
Add me to a group if you want to play with friends.
You can use /help to see all available commands.`;
}

const help_message =
  `/rules - Shows a link about the game and pdf rules.
/creategame - Create a new game.
/joingame - Join into a created game. You can not join into a started game.
/leavegame - Player leaves the game. If last player leaves, the game is cancelled.
/startgame - Start the first round of a created game. Once started, no players can join it.
/status - Shows the current game status like player turn, player energy, current objetive, register values, unresolved objetives queue and objetives left.
/operations - Shows the list of register operations and its energy cost.
/endturn - Player ends the current turn.
/cancelgame - Cancel the created game. It can not be resumed.
/help - Shows this command list.
/inc - How to use: "/inc B".
/dec - How to use: "/dec B".
/rol - How to use: "/rol B".
/ror - How to use: "/ror B".
/mov - How to use: "/mov A C". Register A will be modified.
/not - How to use: "/not D".
/or - How to use: "/or C B". Register C will be modified.
/and - How to use: "/and C B". Register C will be modified.
/xor - How to use: "/xor C B". Register C will be modified.`;

const rules_message =
  `[What is moon (1110011)?](http://compus.deusto.es/moon/)\n
[Rule book](http://tiny.cc/moonboardgame-en)`;

const opList_message =
  `
\`\`\`
Operation  Target  Cost
---------  ------  ----
  inc      1 Reg   2  \u{1F50B}
  dec      1 Reg   2  \u{1F50B}
  rol      1 Reg   1  \u{1F50B}
  ror      1 Reg   1  \u{1F50B}
  mov      2 Reg   1  \u{1F50B}
  not      1 Reg   1  \u{1F50B}
  or       2 Reg   0.5\u{1F50B}
  and      2 Reg   0.5\u{1F50B}
  xor      2 Reg   0.5\u{1F50B}

All 2 register operations store the result in the first register.
"or A B" will modify register A.
"mov A B" will copy register B value into register A.\`\`\``;