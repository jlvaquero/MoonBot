require('dotenv').config();
const { telegramEventMessages } = require('./eventMessages');
const { OperationCode } = require('./gameRules');
const EngineEvents = require('./engineEvents');
const EngineCommands = require('./engineCommands');
const { sprintf } = require('sprintf-js');
const TelegramBot = require('node-telegram-bot-api');
const { concatMap, map } = require('rxjs/operators');
const { partition, Subject } = require('rxjs');
const keyBoards = require('./telegramKeyboard');
const { Rules, GameEventType } = require('./gameRules');

//main flow
//keeping simple https://xkcd.com/974/
const showStateEvent = Symbol.for("SHOW_GAME_STATE");
const Store = require('./store/storeContainer'); //redis store recommended for production
const commandStream = new Subject();
const Game = require('./moonGame')(Store);
const gameEventStream = Game.EventStream;
const eventStreams = eventSubscriptions(gameEventStream);
const statistics = require('./statistics/statistics')(gameEventStream);
const recorder = require('./recorder/recorder')(commandStream);
const bot = telegramBot();
configureTelegramBot(bot);
//end main flow

function telegramBot() {

  const token = process.env.MOON_BOT_TOKEN;
  const useWebHook = process.env.MOON_BOT_USE_WEBHOOK;
  const public_url = process.env.MOON_BOT_PUBLIC_URL;
  const public_port = process.env.MOON_BOT_PUBLIC_PORT;
  const bind_port = process.env.MOON_BOT_BIND_PORT;
  const bind_host = process.env.MOON_BOT_BIND_HOST_IP;

  let initBot;

  if (useWebHook) {

    initBot = () => {
      const options = {
        webHook: {
          bind_port,
          bind_host
        }
      };
      const bot = new TelegramBot(token, options);
      bot.setWebHook(`${public_url}:${public_port}/bot${token}`);
      return bot;
    };
  }
  else {
    initBot = () => {
      const options = {
        polling: true
      };
      return new TelegramBot(token, options);
    };
  }

  return initBot();
}

function eventSubscriptions(eventStream) {
  /*
   * Obtain game event stream and subscribe for behaviour
   */

  function notify(messageData) {

    const notifyMessage = () => sendMessage(messageData.playerId, messageData.chatId, messageData.message, messageData.keyBoard);
    const notifyGameState = () => sendGameStatus(messageData.playerId, messageData.chatId, messageData.gameState);

    return messageData.sendStatus ? notifyGameState() : notifyMessage();
  }

  function toMessage(event) {

    const shouldBeFixKb = () => event.gameEvent && event.gameEvent.eventType === GameEventType.Ok;

    return {
      playerId: event.playerId,
      chatId: event.gameState.id,
      message: event.gameEvent ? telegramEventMessages[event.gameEvent.eventType] : telegramEventMessages[event.eventType],
      keyBoard: shouldBeFixKb() ? keyBoards.fixKeyBoard(event.gameState.errors) : undefined,
      gameState: event.gameState,
      sendStatus: event.eventType === showStateEvent
    };
  }
  /*let numBitsMissedEvents;
  let numBugsMissedEvents;
  let maxEnergyMissedEvents;
  let useEventsMissedEvents;
  let noGameInstanceEvents;*/

  //isolate events to react in a different way on each
  [numBitsMissedEvents, restOfEvents] = partition(eventStream, event => event.eventType === EngineEvents.gameNumBitsMissed);
  [numBugsMissedEvents, restOfEvents] = partition(restOfEvents, event => event.eventType === EngineEvents.gameNumBugsMissed);
  [maxEnergyMissedEvents, restOfEvents] = partition(restOfEvents, event => event.eventType === EngineEvents.gameMaxEnergyMissed);
  [useEventsMissedEvents, restOfEvents] = partition(restOfEvents, event => event.eventType === EngineEvents.gameUseEventsMissed);
  [noGameInstanceEvents, restOfEvents] = partition(restOfEvents, event => event.eventType === EngineEvents.gameNotCreated);
  [fixOperationApplied, restOfEvents] = partition(restOfEvents, event => event.eventType === EngineEvents.fixOperationApplied);

  //on event send inlinekeyboard asking for num of bits 
  numBitsMissedEvents.subscribe({
    next(event) {
      return sendMessage(event.playerId, event.gameId, telegramEventMessages[event.eventType], keyBoards.numBitsKeyboard());
    }
  });
  //on event send inlinekeyboard asking for num of bugs
  numBugsMissedEvents.subscribe({
    next(event) {
      return sendMessage(event.playerId, event.gameId, telegramEventMessages[event.eventType], keyBoards.numBugsKeyboard(event.numBits));
    }
  });
  //on event send inlinekeyboard asking for max energy value
  maxEnergyMissedEvents.subscribe({
    next(event) {
      return sendMessage(event.playerId, event.gameId, telegramEventMessages[event.eventType], keyBoards.maxEnergyKeyboard(event.numBits, event.numBugs));
    }
  });
  //on event send inlinekeyboard asking for use game events or not
  useEventsMissedEvents.subscribe({
    next(event) {
      return sendMessage(event.playerId, event.gameId, telegramEventMessages[event.eventType], keyBoards.useEventsKeyboard(event.numBits, event.numBugs, event.maxEnergy));
    }
  });

  //on events where there is not game instance
  noGameInstanceEvents.subscribe({
    next(event) {
      return sendMessage(event.playerId, event.gameId, telegramEventMessages[event.eventType]);
    }
  });

  //send message and send gameState
  fixOperationApplied.subscribe({
    next(event) {
      commandStream.next({ type: EngineCommands.applyFix, gameId: event.gameState.id, gameUUID: event.gameState.uuid, playerId: event.playerId, error: event.error });
      return sendMessage(event.playerId, event.gameState.id, telegramEventMessages[event.eventType]).
        then(() => sendGameStatus(event.playerId, event.gameState.id, event.gameState));
    }
  });

  /*react on the rest of the events
concatMap creates a observable for each async execution and subscribe to it before continue to the next async execution
this ensures the order of the messages sent to the chat.*/
  restOfEvents.pipe(map(toMessage)).pipe(concatMap(messageData => notify(messageData))).subscribe();

  return {

    numBitsMissedEvents,
    numBugsMissedEvents,
    maxEnergyMissedEvents,
    useEventsMissedEvents,
    noGameInstanceEvents,
    fixOperationApplied

  };
}

function configureTelegramBot(bot) {
  //configure bot behaviour with regExp
  bot.onText(/^\/start$/, InitConversationRequest);
  bot.onText(/^\/creategame$/, CreateGameRequest);
  bot.on('callback_query', inlineCallbackParser);
  bot.onText(/^\/joingame$/, JoinGameRequest);
  bot.onText(/^\/leavegame$/, LeaveGameRequest);
  bot.onText(/^\/startgame$/, StartGameRequest);
  bot.onText(/^\/status$/, StatusGameRequest);
  bot.onText(/^\/endturn$/, EndTurnRequest);
  bot.onText(/^\/cancelgame$/, CancellGameRequest);
  bot.onText(/^\/help$/, HelpRequest);
  bot.onText(/^\/rules$/, RulesRequest);
  bot.onText(/^\/operations$/, OperationListRequest);
  bot.onText(/^\/(inc|INC) ([A-D]|[a-d])$/, IncRequest);
  bot.onText(/^\/(dec|DEC) ([A-D]|[a-d])$/, DecRequest);
  bot.onText(/^\/(rol|ROL) ([A-D]|[a-d])$/, RolRequest);
  bot.onText(/^\/(ror|ROR) ([A-D]|[a-d])$/, RorRequest);
  bot.onText(/^\/(mov|MOV) ([A-D]|[a-d]) ([A-D]|[a-d])$/, MovRequest);
  bot.onText(/^\/(not|NOT) ([A-D]|[a-d])$/, NotRequest);
  bot.onText(/^\/(or|OR) ([A-D]|[a-d]) ([A-D]|[a-d])$/, OrRequest);
  bot.onText(/^\/(and|AND) ([A-D]|[a-d]) ([A-D]|[a-d])$/, AndRequest);
  bot.onText(/^\/(xor|XOR) ([A-D]|[a-d]) ([A-D]|[a-d])$/, XorRequest);
  bot.onText(/^\/(add|ADD) ([A-D]|[a-d]) ([A-D]|[a-d])$/, AddRequest);
  bot.onText(/^\/(sub|SUB) ([A-D]|[a-d]) ([A-D]|[a-d])$/, SubRequest);
  bot.onText(/^\/(nor|NOR) ([A-D]|[a-d]) ([A-D]|[a-d])$/, NorRequest);
  bot.onText(/^\/(nand|NAND) ([A-D]|[a-d]) ([A-D]|[a-d])$/, NandRequest);
  bot.onText(/^\/(nxor|NXOR) ([A-D]|[a-d]) ([A-D]|[a-d])$/, NxorRequest);

  function InitConversationRequest(msg) {
    bot.sendMessage(msg.chat.id, welcome_message(msg));
  }

  function CreateGameRequest(msg) {
    Game.CreateGame(msg.chat.id, msg.from.username);
  }

  //handle inline keyboard responses
  async function inlineCallbackParser(callbackQuery) {

    let args = new Array();
    args.push(callbackQuery.message.chat.id); //gameId
    args.push(callbackQuery.from.username); //playerId
    args = args.concat(callbackQuery.data.split(" "));

    if (args[2] === "fix") { //[gameId, playerId, fix, B]
      await Game.FixError.apply(Game, args); //will raise fixOperationApplied event
    }
    else {
      await Game.CreateGame.apply(Game, args); // [gameId, playerId, ...create game parameters]; will raise missed events if args is incomplete
    }

    bot.answerCallbackQuery(callbackQuery.id); //just finish the callback; the job will be done on missed events subscriptions
  }

  function JoinGameRequest(msg) {
    Game.JoinGame(msg.chat.id, msg.from.username); //will raise events
  }

  function LeaveGameRequest(msg) {
    Game.LeaveGame(msg.chat.id, msg.from.username); //will raise events
  }

  async function StartGameRequest(msg) {
    const gameState = await Game.StartGame(msg.chat.id, msg.from.username); //will raise events
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.startGame, gameUUID: gameState.uuid, playerId: msg.from.username, gameState });
    }
  }

  async function StatusGameRequest(msg) {
    const gameState = await Game.StatusGame(msg.chat.id, msg.from.username);
    if (gameState) { gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState }); }
  }

  async function EndTurnRequest(msg) {
    const gameState = await Game.EndPlayerTurn(msg.chat.id, msg.from.username);
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.endTurn, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username });
    }
  }

  async function CancellGameRequest(msg) {
   const gameState = await Game.CancelGame(msg.chat.id);
    if (gameState) {
      commandStream.next({ type: EngineCommands.cancelGame, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username });
    }
  }

  function HelpRequest(msg) {
    return sendMessage(msg.from.username, msg.chat.id, help_message);
  }

  function RulesRequest(msg) {
    return sendMessage(msg.from.username, msg.chat.id, rules_message);
  }

  function OperationListRequest(msg) {
    return sendMessage(msg.from.username, msg.chat.id, opList_message);
  }

  //partial applied funcions to provide naming context makes this more readable 
  const ExecuteIncOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.inc);
  const ExecuteDecOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.dec);
  const ExecuteRolOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.rol);
  const ExecuteRorOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.ror);
  const ExecuteMovOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.mov);
  const ExecuteNotOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.not);
  const ExecuteOrOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.or);
  const ExecuteAndOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.and);
  const ExecuteXorOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.xor);

  const ExecuteAddOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.add);
  const ExecuteSubOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.sub);
  const ExecuteNorOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.nor);
  const ExecuteNandOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.nand);
  const ExecuteNxorOperation = Game.ExecuteBitOperation.bind(Game, OperationCode.nxor);


  async function IncRequest(msg, match) {
    const gameState = await ExecuteIncOperation(msg.chat.id, msg.from.username, match[2].toUpperCase()); //use the partial applied functions above
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.inc, target1: match[2].toUpperCase(), target2: undefined });
    }
  }

  async function DecRequest(msg, match) {
    const gameState = await ExecuteDecOperation(msg.chat.id, msg.from.username, match[2].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.dec, target1: match[2].toUpperCase(), target2: undefined });
    }
  }

  async function RolRequest(msg, match) {
    const gameState = await ExecuteRolOperation(msg.chat.id, msg.from.username, match[2].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.rol, target1: match[2].toUpperCase(), target2: undefined });
    }
  }

  async function RorRequest(msg, match) {
    const gameState = await ExecuteRorOperation(msg.chat.id, msg.from.username, match[2].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.ror, target1: match[2].toUpperCase(), target2: undefined });
    }

  }

  async function MovRequest(msg, match) {
    const gameState = await ExecuteMovOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.mov, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }
  async function NotRequest(msg, match) {
    const gameState = await ExecuteNotOperation(msg.chat.id, msg.from.username, match[2].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.not, target1: match[2].toUpperCase(), target2: undefined });
    }

  }

  async function OrRequest(msg, match) {
    const gameState = await ExecuteOrOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.or, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }

  async function AndRequest(msg, match) {
    const gameState = await ExecuteAndOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.and, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }

  async function XorRequest(msg, match) {
    const gameState = await ExecuteXorOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.xor, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }

  async function AddRequest(msg, match) {
    const gameState = await ExecuteAddOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.add, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }

  async function SubRequest(msg, match) {
    const gameState = await ExecuteSubOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.sub, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }
  async function NorRequest(msg, match) {
    const gameState = await ExecuteNorOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.nor, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }

  async function NandRequest(msg, match) {
    const gameState = await ExecuteNandOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.nand, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }

  async function NxorRequest(msg, match) {
    const gameState = await ExecuteNxorOperation(msg.chat.id, msg.from.username, match[2].toUpperCase(), match[3].toUpperCase());
    if (gameState) {
      gameEventStream.next({ eventType: showStateEvent, gameId: msg.chat.id, playerId: msg.from.username, gameState });
      commandStream.next({ type: EngineCommands.applyOperation, gameId: gameState.id, gameUUID: gameState.uuid, playerId: msg.from.username, operation: OperationCode.nxor, target1: match[2].toUpperCase(), target2: match[3].toUpperCase() });
    }

  }
}
//gameState to telegram message
function buildStatusMessage(gameState) {

  if (!gameState) { return null; }

  const lockedRegister = (hasError) => hasError ? "\u{274C}" : "";
  const lockedOperation = (hasError) => hasError ? "\u{274C}" : "\u{2705}";
  const playerTurn = () => gameState.playerList[gameState.playerTurn].name;
  const eneryLeft = () => gameState.playerList[gameState.playerTurn].energy;
  const currentObjetive = () => gameState.currentObjetive.value.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerA = () => gameState.registers.A.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerB = () => gameState.registers.B.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerC = () => gameState.registers.C.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const registerD = () => gameState.registers.D.toString(2).padStart(gameState.numBits, "0".repeat(gameState.numBits));
  const objetivesLeft = () => gameState.objetives.length;
  const unresolved = () => gameState.unresolved;
  const maxUnresolved = () => Rules.MaxUnresolvedValue - gameState.bugsFound;

  return `\`\`\`
\u{1F5A5}
$> \u{1F468}\u{200D}\u{1F680} turn: ${playerTurn()}
$> ${eneryLeft()} \u{1F50B} left
$> Objetive:

-> ${currentObjetive()}
-----------------
A: ${registerA()}
-----------------
B: ${registerB()} ${lockedRegister(gameState.errors.B)}
-----------------
C: ${registerC()} ${lockedRegister(gameState.errors.C)}
-----------------
D: ${registerD()} ${lockedRegister(gameState.errors.D)}
-----------------

$> Instruction status:
   ROL: ${lockedOperation(gameState.errors.ROL)}
   NOT: ${lockedOperation(gameState.errors.NOT)}
   XOR: ${lockedOperation(gameState.errors.XOR)}

$> \u{1F41E} found: ${gameState.bugsFound}
$> Objetive slot: ${unresolved()}/${maxUnresolved()}
$> Objetives in queue: ${objetivesLeft()}
$> man\`\`\` /operations`;

}

//send message if not null or undefined
function sendMessage(playerId, chatId, message, keyboard) {
  if (!message) { return Promise.resolve(); }
  return bot.sendMessage(chatId, sprintf(message, playerId), { parse_mode: "Markdown", reply_markup: keyboard });
}

//send game status if not null or undefined
async function sendGameStatus(playerId, chatId, gameState) {
  if (!gameState) { return Promise.resolve(); }
  return sendMessage(playerId, chatId, buildStatusMessage(gameState));
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
/xor - How to use: "/xor C B". Register C will be modified.
/add - How to use: "/add C B". Register C will be modified.
/sub - How to use: "/sub C B". Register C will be modified.
/nor - How to use: "/nor C B". Register C will be modified.
/nand - How to use: "/nand C B". Register C will be modified.
/nxor - How to use: "/xor C B". Register C will be modified.`;

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
  add      2 Reg   1.5\u{1F50B}
  sub      2 Reg   1.5\u{1F50B}
  nor      2 Reg   1  \u{1F50B}
  nand     2 Reg   1  \u{1F50B}
  nxor     2 Reg   1  \u{1F50B}

All 2 register operations store the result in the first register.
"or A B" will modify register A.
"mov A B" will copy register B value into register A.\`\`\``;


process.on('SIGINT', async function () {
  commandStream.complete();
  await Game.Quit();
  await statistics.quit();
  await recorder.quit();
});