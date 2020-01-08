const ObjetivesGenerator = require('./objetives');
const GameRules = require('./gameRules');
const GameEvents = require('./gameEvents');

const playerIs = (currentName) => (player) => player.name === currentName;
const playerIsNot = (currentName) => (player) => player.name !== currentName;

const gameStateManager = {

  CreateNewGameState(gameId, playerId, numBits) {

    const events = new Array();

    let createdGameState = { ...newGameState };
    createdGameState.id = gameId;
    createdGameState.numBits = GameRules.KeepNumBitsRange(numBits);
    createdGameState.registers = { ...newRegisterState };
    createdGameState.playerList = new Array();

    var { registerValues, objetives } = ObjetivesGenerator(numBits);
    createdGameState.objetives = objetives;

    createdGameState.registers.B = registerValues[0];
    createdGameState.registers.C = registerValues[1];
    createdGameState.registers.D = registerValues[2];

    events.push(GameEvents.gameCreated);

    let { joinEvents, gameState } = this.JoinPlayer(createdGameState, playerId);
    events.concat(joinEvents);

    return { events, gameState };
  },

  JoinPlayer(gameState, playerId) {

    const alreadyJoined = () => GameRules.PlayerIsInGame(gameState, playerId);

    if (gameState.started) { return { events: [GameEvents.gameAlreadyStarted], gameState }; } 

    if (alreadyJoined()) { return { events: [GameEvents.playerAlreadyJoined], gameState }; }

    let playerState = { ...newPlayerState };
    playerState.name = playerId;
    gameState.playerList.push(playerState);

    return { events: [GameEvents.playerJoined], gameState };
  },

  LeavePlayer(gameState, playerId) {

    const alreadyJoined = () => GameRules.PlayerIsInGame(gameState, playerId);
   
    const ofPlayerLeaving = playerIs(playerId);
    const playerPosition = () => {
      const position = gameState.playerList.findIndex(ofPlayerLeaving);
      return position ? position : gameState.playerTurn;
    };
    const nexPlayerTurn = () => (playerPosition() < gameState.playerTurn) ? gameState.playerTurn - 1 : gameState.playerTurn;
    const playerLeaving = playerIsNot(playerId);
    const noPlayers = () => GameRules.NoPlayersLeft(gameState);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }

    gameState.playerList = gameState.playerList.filter(playerLeaving);
    gameState.playerTurn = nexPlayerTurn();

    const events = new Array();
    events.push(GameEvents.playerLeft);

    if (noPlayers()) { events.push(GameEvents.noPlayersLeft);} 

    return { events, gameState };
  },

  StartGame(gameState, playerId) {
    const alreadyJoined = () => GameRules.PlayerIsInGame(gameState, playerId);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }

    gameState.started = true;
    return { events: [GameEvents.gameStarted], gameState };
  },

  EndTurn(gameState, playerId) {
    const alreadyJoined = () => GameRules.PlayerIsInGame(gameState, playerId);
    const endRound = () => GameRules.LastPlayerPlaying(gameState);
    const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = GameRules.MaxEnergy; return playerState; });
    const isCurrentPlayerTurn = () => GameRules.IsPlayerTurn(gameState, playerId);
    const loose = () => GameRules.MaxUnresolvedReached(gameState);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }
    if (!gameState.started) { return { events: [GameEvents.gameNotStarted], gameState }; }
    if (!isCurrentPlayerTurn()) { return { events: [GameEvents.notPlayerTurn], gameState }; }

    const events = new Array();

    if (endRound()) {
      gameState.playerTurn = 0;
      gameState.unresolved += 1;
      gameState.playerList = resetEnergy();
    }
    else { gameState.playerTurn += 1; }

    events.push(GameEvents.turnEnded);
    if (loose()) { event.push(GameEvents.gameLost); }
    return { events, gameState };
  },

  ExecuteBitOperation(gameState, playerId, operation, cost, reg1, reg2) {

    const alreadyJoined = () => GameRules.PlayerIsInGame(gameState, playerId);
    const isCurrentPlayerTurn = () => GameRules.IsPlayerTurn(gameState, playerId);
    const enoughEnergy = () => GameRules.EnoughEnergyFor(gameState, operation);
    const shouldEndTurn = () => GameRules.NoEnergyLeft(gameState);
    const objetiveAccomplished = () => GameRules.ObjetiveIsInRegA(gameState);
    const win = () => GameRules.NoObjetivesLeft(gameState);
    const loose = () => GameRules.MaxUnresolvedReached(gameState);
    const player = () => GameRules.CurrentPlayer(gameState);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }
    if (!gameState.started) { return { events: [GameEvents.gameNotStarted], gameState }; }
    if (!isCurrentPlayerTurn()) { return { events: [GameEvents.notPlayerTurn], gameState }; }
    if (!enoughEnergy()) { return { events: [GameEvents.notEnoughEnergy], gameState }; }

    gameState.registers[reg1] = operation(gameState.registers[reg1], gameState.registers[reg2]);
    player().energy -= cost;

    const events = new Array();
    events.push(GameEvents.operationApplied);

    if (objetiveAccomplished()) {
      gameState = this.AccomplishObjetive(gameState);
      events.push(GameEvents.objetiveAccomplished);
    }

    if (shouldEndTurn()) {
      let { endTunrEvents, newGameState } = this.EndTurn(gameState);
      events.concat(endTunrEvents);
      gameState = newGameState;
    }

    if (loose()) {
      events.push(GameEvents.gameLost);
      return { events, gameState };
    
    }

    if (win()) {
      events.push(GameEvents.gameWon);
      return { events, gameState };
    }

    return { events, gameState };

  },

  AccomplishObjetive(gameState) {

    const unresolvedObjetivesLeft = () => gameState.unresolved > 1 ? gameState.unresolved - 1 : gameState.unresolved;

    gameState.objetives.pop();
    gameState.unresolved = unresolvedObjetivesLeft();
    return gameState;
  }

};

const newGameState = {
  id: 0,
  numBits: 0,
  unresolved: 1,
  started: false,
  playerTurn: 0,
  registers: {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  }
};

const newRegisterState = {
  A: 0,
  B: 0,
  C: 0,
  D: 0
};

const newPlayerState = {
  name: '',
  energy: GameRules.MaxEnergy
};

module.exports = gameStateManager;