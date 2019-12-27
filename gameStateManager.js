const ObjetivesGenerator = require('./objetives');

const withSameName = (currentName) => (player) => player.name === currentName;

const gameStateManager = {

  CreateNewGameState(gameId, playerId, numBits) {

    let gameState = { ...newGameState };
    gameState.id = gameId;
    gameState.numBits = numBits;
    gameState.registers = { ...newRegisterState };
    gameState.playerList = new Array();

    var { registerValues, objetives } = ObjetivesGenerator(numBits);
    gameState.objetives = objetives;

    gameState.registers.B = registerValues[0];
    gameState.registers.C = registerValues[1];
    gameState.registers.D = registerValues[2];

    return this.JoinPlayer(gameState, playerId);
  },

  JoinPlayer(gameState, newPlayerId) {

    const playerJoining = withSameName(newPlayerId);

    const alreadyJoined = () => gameState.playerList.findIndex(playerJoining) === -1 ? false : true;

    if (alreadyJoined()) { return gameState; }

    let playerState = { ...newPlayerState };
    playerState.name = newPlayerId;

    gameState.playerList.push(playerState);
    return gameState;
  },

  LeavePlayer(gameState, playerId) {

    const playerLeaving = withSameName(playerId);

    const playerPosition = () => {
      let position = gameState.playerList.findIndex(playerLeaving);
      return position ? position : gameState.playerTurn;
    };

    const nexPlayerTurn = () => (playerPosition() < gameState.playerTurn) ? gameState.playerTurn - 1 : gameState.playerTurn;
    const withDifferentName = (player) => player.name !== playerId;

    gameState.playerList = gameState.playerList.filter(withDifferentName);
    gameState.playerTurn = nexPlayerTurn();
    return gameState;
  },

  StartGame(gameState) {
    gameState.started = true;
    return gameState;
  },

  EndTurn(gameState) {

    const endRound = () => gameState.playerTurn === gameState.playerList.length - 1;
    const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = 3; return playerState; });

    if (endRound()) {
      gameState.playerTurn = 0;
      gameState.unresolved += 1;
      gameState.playerList = resetEnergy();
    }
    else { gameState.playerTurn += 1; }

    return gameState;

  },

  ExecuteBitOperation(gameState, operation, cost, reg1, reg2) {

    gameState.registers[reg1] = operation(gameState.registers[reg1], gameState.registers[reg2]);
    gameState.playerList[gameState.playerTurn].energy -= cost;
    return gameState;

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
  energy: 3
};

module.exports = gameStateManager;