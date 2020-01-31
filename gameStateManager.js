const ObjetivesGenerator = require('./objetives');
const { Rules, CardType } = require('./gameRules');
const EngineEvents = require('./engineEvents');
const { Subject } = require('rxjs');
const { pipe } = require('./utils');
const RegisterOperations = require('./registerOperations');

//create the event stream
const eventStream = new Subject();

//stop piping functions on null output and return {gameState :null} as fallback value
const pipeUntilNull = pipe.bind(undefined, (input) => input === null, () => { return { gameState: null }; });

// define the behavior of the operations piping stand alone functions
const joinPlayerPublicApi = pipeUntilNull(
  checkGameWasStarted,
  checkAlreadyJoined,
  joinPlayer,
  raiseGameStatusChanged
);

const leavePlayerPublicApi = pipeUntilNull(
  checkNotJoined,
  leavePlayer,
  checkNoPlayersLeft,
  raiseGameStatusChanged
);

const startGamePublicApi = pipeUntilNull(
  checkNotJoined,
  checkGameWasStarted,
  startGame,
  raiseGameStatusChanged
);

const endTurnPublicApi = pipeUntilNull(
  checkNotJoined,
  checkGameWasNotStarted,
  checkIsNotPlayerTurn,
  checkFixPending,
  endTurn,
  checkGameLost,
  raiseGameStatusChanged
);

const executeBitOperationPublicApi = pipeUntilNull(
  checkNotJoined,
  checkGameWasNotStarted,
  checkIsNotPlayerTurn,
  checkFixPending,
  obtainOperationCost,
  checkNotEnoughEnergy,
  checkOperationLocked,
  checkRegisterLocked,
  executeBitOperation,
  checkObjetiveAccomplished,
  checkGameWon,
  checkShouldEndTurn,
  checkGameLost,
  raiseGameStatusChanged
);

const fixErrorPublicApi = pipeUntilNull(
  checkNoFixLeft,
  checkAlreadyFixed,
  fixError
);

//expose the piped functions as the state manager public api
const gameStateManager = {

  EventStream: eventStream,

  CreateNewGameState: createGame,
  JoinPlayer: joinPlayerPublicApi,
  LeavePlayer: leavePlayerPublicApi,
  StartGame: startGamePublicApi,
  EndTurn: endTurnPublicApi,
  ExecuteBitOperation: executeBitOperationPublicApi,
  fixError: fixErrorPublicApi
};

/*
 * stand alone functions with behaviour. every one has a single responsibility for state checks and raise its related event
 */

function obtainOperationCost({ operation }) {
  return { cost: Rules.OperationCost(operation) };
}

//notfy the game was started to not allow start again or join players
function checkGameWasStarted({ gameState, playerId }) {
  if (gameState.started) {
    eventStream.next({ eventType: EngineEvents.gameAlreadyStarted, gameState, playerId });
    return null;
  }
  return { gameState };
}
//notyfy the game was not started to not allow endturn or bit operations
function checkGameWasNotStarted({ gameState, playerId }) {
  if (!gameState.started) {
    eventStream.next({ eventType: EngineEvents.gameNotStarted, gameState, playerId });
    return null;
  }
  return { gameState };
}

//check the player is already joined to not allow join again
function checkAlreadyJoined({ gameState, playerId }) {
  //provide context, clean and readable code by creating local functions with lambda expressions
  const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

  //input parameters captured in the lambda expression
  if (alreadyJoined()) {
    eventStream.next({ eventType: EngineEvents.playerAlreadyJoined, gameState, playerId });
    return null;
  }
  return { gameState };
}

//check player not joined to not allow ingame commands
function checkNotJoined({ gameState, playerId }) {
  const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

  if (!alreadyJoined()) {
    eventStream.next({ eventType: EngineEvents.playerNotJoined, gameState, playerId });
    return null;
  }
  return { gameState };
}
//check if last player left the game; notyfy it to cancell the game
function checkNoPlayersLeft({ gameState, playerId }) {
  const noPlayers = () => Rules.NoPlayersLeft(gameState);

  if (noPlayers()) {
    eventStream.next({ eventType: EngineEvents.noPlayersLeft, gameState, playerId });
    return null;
  }

  return { gameState };
}

//check if its player turn to accept bit operations and end turn command
function checkIsNotPlayerTurn({ gameState, playerId }) {
  const isCurrentPlayerTurn = () => Rules.IsPlayerTurn(gameState, playerId);

  if (!isCurrentPlayerTurn()) {
    eventStream.next({ eventType: EngineEvents.notPlayerTurn, gameState, playerId });
    return null;
  }

  return { gameState };
}

//notyfy game was lost to cancel it
function checkGameLost({ gameState, playerId }) {
  const loose = () => Rules.MaxUnresolvedReached(gameState);

  if (loose()) {
    eventStream.next({ eventType: EngineEvents.gameLost, gameState, playerId });
    return null;
  }

  return { gameState };
}

//notify operation register is locked
function checkRegisterLocked({ gameState, playerId, cpu_reg1, cpu_reg2 }) {

  const registerLocked = () => gameState.errors[cpu_reg1] || (cpu_reg2 ? gameState.errors[cpu_reg2] : false);

  if (registerLocked()) {
    eventStream.next({ eventType: EngineEvents.registerLocked, gameState, playerId });
    return null;
  }

  return { gameState };
}

//notify operation is locked
function checkOperationLocked({ gameState, playerId, operation }) {

  const operationLocked = () => gameState.errors[operation];

  if (operationLocked()) {
    eventStream.next({ eventType: EngineEvents.operationLocked, gameState, playerId });
    return null;
  }

  return { gameState };
}

//chek if player has energy to perform the requested bit operation
function checkNotEnoughEnergy({ gameState, playerId, cost }) {
  const enoughEnergy = () => Rules.CurrentPlayer(gameState).energy >= cost;

  if (!enoughEnergy()) {
    eventStream.next({ eventType: EngineEvents.notEnoughEnergy, gameState, playerId });
    return null;
  }

  return { gameState };
}

const pipeAlways = pipe.bind(undefined, () => false, null); //pipe without stop condition
//objetive accomplisher decrease objetive; draws and apply game cards
const objetiveAccomplisher = pipeAlways(
  decreaseObjetiveSlot,
  obtainNextObjetive
);

//check if one objetive has benn accomplished and notify it
function checkObjetiveAccomplished({ gameState, playerId }) {

  const objetiveAccomplished = () => Rules.ObjetiveIsInRegA(gameState);


  if (objetiveAccomplished()) {
    eventStream.next({ eventType: EngineEvents.objetiveAccomplished, gameState, playerId });
    return objetiveAccomplisher({ gameState, playerId });
  }

  return { gameState };
}

//modify the game state for accomplish a objetive
function decreaseObjetiveSlot({ gameState }) {

  const unresolvedObjetivesLeft = () => gameState.unresolved - 1;

  gameState.unresolved = unresolvedObjetivesLeft();
  return { gameState };
}

//draws game cards until a objetive card is found; apply event card on the course of looking for a objetive card
function obtainNextObjetive({ gameState, playerId }) {

  let card = gameState.objetives.pop();
  while (card && card.type !== CardType.Objetive) {
    gameState = applyCardRules(gameState, card, playerId);
    card = gameState.objetives.pop();
  }

  gameState.currentObjetive = card;

  return { gameState };
}

//apply the card rules and raise related events
function applyCardRules(gameState, card, playerId) {

  gameState = card.applyRules(gameState);

  switch (card.type) {
    case CardType.Bug:
      eventStream.next({ eventType: EngineEvents.bugFound, gameState, playerId });
      break;
    case CardType.Event:
      eventStream.next({ eventType: EngineEvents.gameEventFound, gameEvent: card, gameState, playerId });
      break;
  }

  return gameState;
}

//notyfy game was won to cancel it
function checkGameWon({ gameState, playerId }) {
  const win = () => Rules.NoObjetivesLeft(gameState);

  if (win()) {
    eventStream.next({ eventType: EngineEvents.gameWon, gameState, playerId });
    return null;
  }

  return { gameState };
}

//notify a fix event is pending of confirmation
function checkFixPending({ gameState, playerId }) {
  const fixRequested = () => gameState.errors.fixPending !== 0;

  if (fixRequested()) {
    eventStream.next({ eventType: EngineEvents.fixOperationPending, gameState, playerId });
    return null;
  }

  return { gameState };
}

//notify no more fix events left
function checkNoFixLeft({ gameState, playerId }) {
  const noFixLeft = () => gameState.errors.fixPending === 0;
  if (noFixLeft()) {
    eventStream.next({ eventType: EngineEvents.noFixLeft, gameState, playerId });
    return null;
  }

  return { gameState };
}

function checkAlreadyFixed({ gameState, playerId, error }) {
  const alreadyFixed = () => gameState.errors[error] === false;

  if (alreadyFixed()) {
    eventStream.next({ eventType: EngineEvents.alreadyFixed, gameState, playerId });
    return null;
  }

  return { gameState };
}

//check if an automatic end turn should happend because player has 0 energy or there is no unresolved objetives in unresolved queue
function checkShouldEndTurn({ gameState, playerId }) {

  const noUnresolvedLeft = Rules.NoUnresolvedLeft(gameState);
  const shouldEndTurn = () => Rules.NoEnergyLeft(gameState) || noUnresolvedLeft;

  if (shouldEndTurn()) {
    return endTurn({ gameState, playerId });
  }

  return { gameState };
}

//notify the game state has changed
function raiseGameStatusChanged({ gameState, playerId }) {
  eventStream.next({ eventType: EngineEvents.gameStatusChanged, gameState, playerId });
  return { gameState };
}

/*
 Core main functions. All previous and further checks are done piping the check functions.
 */
//game creation with inital state
function createGame({ gameId, playerId, numBits, numBugs, maxEnergy, useEvents }) {

  const { registerValues, objetives, currentObjetive } = ObjetivesGenerator(numBits, Rules.KeepNumBugsInRange(numBugs), useEvents);

  let gameState = {
    ...newGameState,
    errors: {...errors },
    id: gameId,
    numBits: Rules.KeepNumBitsRange(numBits),
    playerList: new Array(),
    currentObjetive: currentObjetive,
    objetives: objetives,
    registers: {
      ...newRegisterState,
      B: registerValues[0],
      C: registerValues[1],
      D: registerValues[2]
    },
    rules: {
      maxEnergy: Rules.KeepMaxEnergyInRange(maxEnergy)
    }
  };

  eventStream.next({ eventType: EngineEvents.gameCreated, gameState, playerId });
  gameState = joinPlayer({ gameState, playerId }).gameState;
  raiseGameStatusChanged({ gameState });
  return { gameState };
}

function joinPlayer({ gameState, playerId }) {

  const playerState = {
    name: playerId,
    energy: gameState.rules.maxEnergy
  };

  gameState.playerList.push(playerState);
  eventStream.next({ eventType: EngineEvents.playerJoined, gameState, playerId });
  return { gameState };
}

function leavePlayer({ gameState, playerId }) {

  const playerIs = (currentName) => (player) => player.name === currentName;
  const playerIsNot = (currentName) => (player) => player.name !== currentName;
  const ofPlayerLeaving = playerIs(playerId);
  const playerLeaving = playerIsNot(playerId);

  const playerPosition = () => {
    return gameState.playerList.findIndex(ofPlayerLeaving);
  };
  const nexPlayerTurn = () => (playerPosition() < gameState.playerTurn) ? gameState.playerTurn - 1 : gameState.playerTurn;

  gameState.playerList = gameState.playerList.filter(playerLeaving);
  gameState.playerTurn = nexPlayerTurn();

  eventStream.next({ eventType: EngineEvents.playerLeft, gameState, playerId });

  return { gameState };
}

function startGame({ gameState, playerId }) {

  gameState.started = true;
  eventStream.next({ eventType: EngineEvents.gameStarted, gameState, playerId });
  return { gameState };
}

function endTurn({ gameState, playerId }) {

  const endRound = () => Rules.LastPlayerPlaying(gameState);
  const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = gameState.rules.maxEnergy; return playerState; });

  eventStream.next({ eventType: EngineEvents.turnEnded, gameState, playerId });

  if (!endRound()) {
    gameState.playerTurn += 1;
  }
  else {
    gameState.playerTurn = 0;
    gameState.unresolved += 1;
    gameState.playerList = resetEnergy();
    eventStream.next({ eventType: EngineEvents.roundFinished, gameState, playerId });
  }

  return { gameState };
}

function executeBitOperation({ gameState, playerId, operation, cost, cpu_reg1, cpu_reg2 }) {

  const player = () => Rules.CurrentPlayer(gameState);
  const cpu_reg_value = (reg) => reg ? gameState.registers[reg] : reg;

  const operationFnc = RegisterOperations(gameState.numBits)[operation];

  gameState.registers[cpu_reg1] = operationFnc(cpu_reg_value(cpu_reg1), cpu_reg_value(cpu_reg2));
  player().energy -= cost;

  eventStream.next({ eventType: EngineEvents.operationApplied, gameState, playerId });
  return { gameState };
}

/*Fix error core function. OK cards > 1 could been draw (fixPending > 1) but only 1 system error could be present;
  fixPending should decrease by 1 or reset to 0 if no more system errors left*/
function fixError({ gameState, playerId, error }) {
  gameState.errors[error] = false;
  gameState.errors.fixPending = Rules.SomeSystemError(gameState) ? gameState.errors.fixPending - 1 : 0; 
  eventStream.next({ eventType: EngineEvents.fixOperationApplied, gameState, playerId });
  return { gameState };
}

//default game state for new game
const newGameState = {
  unresolved: 1,
  started: false,
  playerTurn: 0,
  bugsFound: 0
};

//default game state errors for new game
const errors = {
  fixPending: 0,
  B: false,
  C: false,
  D: false,
  ROL: false,
  NOT: false,
  XOR: false
};

//defauls register state for new game
const newRegisterState = {
  A: 0
};

//expose just the public api
module.exports = gameStateManager;