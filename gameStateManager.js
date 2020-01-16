const ObjetivesGenerator = require('./objetives');
const { Rules, CardType } = require('./gameRules');
const EngineEvents = require('./engineEvents');
const { Subject } = require('rxjs');
const { pipe } = require('./utils');

//create the event stream
const eventStream = new Subject();

//stop piping functions on null output and return {gameState :null} as fallback value
const pipeUntilNull = pipe.bind(undefined, (input) => input === null, () => { return { gameState: null }; });
/* define the behavior of the operations piping stand alone functions
   maintenance here is a piece of cake*/
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
  endTurn,
  checkGameLost,
  raiseGameStatusChanged
);

const executeBitOperationPublicApi = pipeUntilNull(
  checkNotJoined,
  checkGameWasNotStarted,
  checkIsNotPlayerTurn,
  checkNotEnoughEnergy,
  executeBitOperation,
  checkObjetiveAccomplished,
  checkGameWon,
  checkShouldEndTurn,
  checkGameLost,
  raiseGameStatusChanged
);

//expose the piped functions as the state manager public api
const gameStateManager = {

  EventStream: eventStream,

  CreateNewGameState: createGame,
  JoinPlayer: joinPlayerPublicApi,
  LeavePlayer: leavePlayerPublicApi,
  StartGame: startGamePublicApi,
  EndTurn: endTurnPublicApi,
  ExecuteBitOperation: executeBitOperationPublicApi

};

/*
 * stand alone functions with behaviour. every one has a single responsibility for state checks and raise its related event
 */

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

//check player not joined to just allow join
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

//chek if player has energy to perform the requested bit operation
function checkNotEnoughEnergy({ gameState, playerId, cost }) {
  const enoughEnergy = () => Rules.CurrentPlayer(gameState).energy >= cost;

  if (!enoughEnergy()) {
    eventStream.next({ eventType: EngineEvents.notEnoughEnergy, gameState, playerId });
    return null;
  }

  return { gameState };
}

//check if one objetive has benn accomplished and notify it
function checkObjetiveAccomplished({ gameState, playerId }) {

  const objetiveAccomplished = () => Rules.ObjetiveIsInRegA(gameState);
  const pipeAlways = pipe.bind(undefined, () => false, null); //pipe without stop condition

  const objetiveAccomplisher = pipeAlways(
    decreaseObjetiveSlot,
    obtainNextObjetive
  );

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

//modify the game state for accomplish a objetive
function obtainNextObjetive({ gameState, playerId }) {

  let card = gameState.objetives.pop();
  while (card && card.type !== CardType.Objetive) {
    gameState = applyCardRules(gameState, card, playerId);
    card = gameState.objetives.pop();
  }

  gameState.currentObjetive = card;

  return { gameState };
}

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

//check if an automatic end turn should happend because playes has 0 energy or there is no unresolved objetives in unresolved queue
function checkShouldEndTurn({ gameState, playerId }) {

  const noUnresolvedLeft = Rules.NoUnresolvedLeft(gameState);
  const shouldEndTurn = () => Rules.NoEnergyLeft(gameState) || noUnresolvedLeft;

  if (shouldEndTurn()) {
    if (noUnresolvedLeft) { gameState.unresolved = 1; } //keep at least one unresolved until win
    return endTurn({ gameState, playerId });
  }

  return { gameState };
}

//notify the game state has changed
function raiseGameStatusChanged({ gameState , playerId}) {
  eventStream.next({ eventType: EngineEvents.gameStatusChanged, gameState, playerId });
  return { gameState };
}

//
function createGame({ gameId, playerId, numBits, numBugs, maxEnergy, useEvents }) { //TODO: include bugs and events

  const { registerValues, objetives } = ObjetivesGenerator(numBits, Rules.KeepNumBugsInRange(numBugs), useEvents);

  let gameState = Object.assign(
    { ...newGameState },
    {
      id: gameId,
      numBits: Rules.KeepNumBitsRange(numBits),
      playerList: new Array(),
      currentObjetive: objetives.pop(),
      objetives: objetives,
      registers: Object.assign(
        { ...newRegisterState },
        {
          B: registerValues[0],
          C: registerValues[1],
          D: registerValues[2]
        }),
      rules: {
        maxEnergy: Rules.KeepMaxEnergyInRange(maxEnergy)
      }
    });

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

  gameState.registers[cpu_reg1] = operation(gameState.registers[cpu_reg1], gameState.registers[cpu_reg2]);
  player().energy -= cost;

  eventStream.next({ eventType: EngineEvents.operationApplied, gameState, playerId });
  return { gameState };
}

const newGameState = {
  unresolved: 1,
  started: false,
  playerTurn: 0,
  bugsFound: 0
};

const newRegisterState = {
  A: 0
};

module.exports = gameStateManager;