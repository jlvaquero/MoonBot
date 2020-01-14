const ObjetivesGenerator = require('./objetives');
const { Rules } = require('./gameRules');
const GameEvents = require('./gameEvents');
const { Subject } = require('rxjs');
const { pipe } = require('./utils');

const eventStream = new Subject();

const pipeUntilNull = pipe.bind(undefined, (input) => input === null, { gameState: null }); //stop piping on null and return {gameState :null}

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

const gameStateManager = {

  EventStream: eventStream,

  CreateNewGameState: createGame,
  JoinPlayer: joinPlayerPublicApi,
  LeavePlayer: leavePlayerPublicApi,
  StartGame: startGamePublicApi,
  EndTurn: endTurnPublicApi,
  ExecuteBitOperation: executeBitOperationPublicApi

};

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
  const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

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

function createGame({ gameId, playerId, numBits }) {

  var { registerValues, objetives } = ObjetivesGenerator(numBits);

  let gameState = Object.assign(
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
        })
    });

  eventStream.next({ eventType: GameEvents.gameCreated, gameId: gameState.id, playerId });
  gameState = joinPlayer({ gameState, playerId }).gameState;
  raiseGameStatusChanged({ gameState });
  return { gameState };
}

function joinPlayer({ gameState, playerId }) {
  let playerState = Object.assign(
    { ...newPlayerState },
    {
      name: playerId
    });

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
    const position = gameState.playerList.findIndex(ofPlayerLeaving);
    return position ? position : gameState.playerTurn;
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
  const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = Rules.MaxEnergy; return playerState; });

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