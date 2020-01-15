const ObjetivesGenerator = require('./objetives');
const { Rules } = require('./gameRules');
const GameEvents = require('./gameEvents');
const { Subject } = require('rxjs');
const { pipe } = require('./utils');

//create the event stream
const eventStream = new Subject();

//stop piping functions on null and return {gameState :null} as fallback value
const pipeUntilNull = pipe.bind(undefined, (input) => input === null, () => { return { gameState: null };}); 

//define the behavior of the operations piping stand alone functions
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

//stand alone functions with behaviour. every one has a single responsibility for state checks and raise one event
function checkGameWasStarted({ gameState, playerId }) {
  if (gameState.started) {
    eventStream.next({ eventType: GameEvents.gameAlreadyStarted, gameId: gameState.id, playerId });
    return null;
  }
  return { gameState };
}

function checkGameWasNotStarted({ gameState, playerId }) {
  if (!gameState.started) {
    eventStream.next({ eventType: GameEvents.gameNotStarted, gameId: gameState.id, playerId });
    return null;
  }
  return { gameState };
}

function checkAlreadyJoined({ gameState, playerId }) {
  //provide context, clean and readable code by creating local functions with lambda expressions
  const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

  //input parameters captured in the lambda expression
  if (alreadyJoined()) { 
    eventStream.next({ eventType: GameEvents.playerAlreadyJoined, gameId: gameState.id, playerId });
    return null;
  }
  return { gameState };
}

function checkNotJoined({ gameState, playerId }) {
  const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

  if (!alreadyJoined()) {
    eventStream.next({ eventType: GameEvents.playerNotJoined, gameId: gameState.id, playerId });
    return null;
  }
  return { gameState };
}

function checkNoPlayersLeft({ gameState, playerId }) {
  const noPlayers = () => Rules.NoPlayersLeft(gameState);

  if (noPlayers()) {
    eventStream.next({ eventType: GameEvents.noPlayersLeft, gameId: gameState.id, playerId });
    return null;
  }

  return { gameState };
}
function checkIsNotPlayerTurn({ gameState, playerId }) {
  const isCurrentPlayerTurn = () => Rules.IsPlayerTurn(gameState, playerId);

  if (!isCurrentPlayerTurn()) {
    eventStream.next({ eventType: GameEvents.notPlayerTurn, gameId: gameState.id, playerId });
    return null;
  }

  return { gameState };
}
function checkGameLost({ gameState, playerId }) {
  const loose = () => Rules.MaxUnresolvedReached(gameState);

  if (loose()) {
    eventStream.next({ eventType: GameEvents.gameLost, gameId: gameState.id, playerId });
    return null;
  }

  return { gameState };
}

function checkNotEnoughEnergy({ gameState, playerId, cost }) {
  const enoughEnergy = () => Rules.CurrentPlayer(gameState).energy >= cost;

  if (!enoughEnergy()) {
    eventStream.next({ eventType: GameEvents.notEnoughEnergy, gameId: gameState.id, playerId });
    return null;
  }

  return { gameState };
}

function checkObjetiveAccomplished({ gameState, playerId }) {
  const objetiveAccomplished = () => Rules.ObjetiveIsInRegA(gameState);
 

  if (objetiveAccomplished()) {
    return accomplishObjetive({ gameState, playerId }); 
  }

  return { gameState };
}

function accomplishObjetive({ gameState, playerId }) {

  const unresolvedObjetivesLeft = () => gameState.unresolved - 1;
  
  gameState.objetives.pop();
  gameState.unresolved = unresolvedObjetivesLeft();

  eventStream.next({ eventType: GameEvents.objetiveAccomplished, gameId: gameState.id, playerId });
  
  return { gameState };
}

function checkGameWon({ gameState, playerId }) {
  const win = () => Rules.NoObjetivesLeft(gameState);

  if (win()) {
    eventStream.next({ eventType: GameEvents.gameWon, gameId: gameState.id, playerId });
    return null;
  }

  return { gameState };
}

function checkShouldEndTurn({ gameState, playerId }) {
  const shouldEndTurn = () => Rules.NoEnergyLeft(gameState) || Rules.NoUnresolvedLeft(gameState);

  if (shouldEndTurn()) {
    return endTurn({ gameState, playerId });
  }

  return { gameState };
}

function raiseGameStatusChanged({ gameState }) {
  eventStream.next({ eventType: GameEvents.gameStatusChanged, gameState });
  return { gameState };
}

function createGame({ gameId, playerId, numBits, numBugs, maxEnergy, useEvents }) { //TODO: include bugs and events

  const { registerValues, objetives } = ObjetivesGenerator(numBits, numBugs, useEvents);

  const gameState = Object.assign(
    { ...newGameState },
    {
      id: gameId,
      numBits: Rules.KeepNumBitsRange(numBits),
      playerList: new Array(),
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

  eventStream.next({ eventType: GameEvents.gameCreated, gameId: gameState.id, playerId });
  raiseGameStatusChanged({ gameState });
  return { gameState };
}

function joinPlayer({ gameState, playerId }) {

  const playerState = {
      name: playerId,
      energy: gameState.rules.maxEnergy
    };

  gameState.playerList.push(playerState);
  eventStream.next({ eventType: GameEvents.playerJoined, gameId: gameState.id, playerId });
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

  eventStream.next({ eventType: GameEvents.playerLeft, gameId: gameState.id, playerId });

  return { gameState };
}

function startGame({ gameState, playerId }) {

  gameState.started = true;
  eventStream.next({ eventType: GameEvents.gameStarted, gameId: gameState.id, playerId });
  return { gameState };
}

function endTurn({ gameState, playerId }) {

  const endRound = () => Rules.LastPlayerPlaying(gameState);
  const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = gameState.rules.MaxEnergy; return playerState; });

  if (endRound()) {
    gameState.playerTurn = 0;
    gameState.unresolved += 1;
    gameState.playerList = resetEnergy();
  }
  else {
    gameState.playerTurn += 1;
  }

  if (Rules.NoUnresolvedLeft(gameState)) gameState.unresolved = 1;

  eventStream.next({ eventType: GameEvents.turnEnded, gameId: gameState.id, playerId });
  return { gameState };
}

function executeBitOperation({ gameState, playerId, operation, cost, cpu_reg1, cpu_reg2 }) {
  const player = () => Rules.CurrentPlayer(gameState);

  gameState.registers[cpu_reg1] = operation(gameState.registers[cpu_reg1], gameState.registers[cpu_reg2]);
  player().energy -= cost;

  eventStream.next({ eventType: GameEvents.operationApplied, gameId: gameState.id, playerId });
  return { gameState };
}

const newGameState = {
  unresolved: 1,
  started: false,
  playerTurn: 0
};

const newRegisterState = {
  A: 0
};

const newPlayerState = {
  energy: Rules.MaxEnergy
};

module.exports = gameStateManager;