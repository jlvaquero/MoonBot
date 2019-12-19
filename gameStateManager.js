const ObjetivesGenerator = require('./objetives');

const withSameName = (currentName) => (player) => player.name === currentName;

const gameStateManager = {

  CreateNewGameState(gameId, playerId, numBits) {

    let gameState = { ...newGameState };
    gameState.playerList = new Array();
    gameState.id = gameId;
    gameState.numBits = numBits;

    var { registerValuesSet, objetives } = ObjetivesGenerator(numBits);
    gameState.objetives = objetives;

    let regValuesArr = [...registerValuesSet];
    gameState.registers.B = regValuesArr[0];
    gameState.registers.C = regValuesArr[1];
    gameState.registers.D = regValuesArr[2];
    return this.JoinPlayer(gameState, playerId);
  },

  JoinPlayer(gameState, newPlayerId) {

    const withNewPlayer = withSameName(newPlayerId);

    const alreadyJoined = () => gameState.playerList.findIndex(withNewPlayer) === -1 ? false : true;

    if (alreadyJoined()) { return gameState; }

    let playerState = { ...newPlayerState };
    playerState.name = newPlayerId;

    gameState.playerList.push(playerState);
    return gameState;
  },

  LeavePlayer(gameState, playerId) {

    const withPlayerLeaving = withSameName(playerId);

    const playerPosition = () => {
      let position = gameState.playerList.findIndex(withPlayerLeaving);
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

    const endRound = () => gameState.playerTurn = gameState.playerList.length - 1;

    if (endRound()) {
      gameState.playerTurn = 0;
      gameState.unresolved += 1;
    }
    else { gameState.playerTurn + 1; }

    return gameState;

  },

  ExecuteBitOperation(gameState, operation, cost, reg1, reg2) {

    gameState.registers[reg1] = operation(gameState.registers[reg1], gameState.registers[reg2]);
    gameState.playerList[gameState.playerTurn].energy -= cost;
    return gameState;

  },

  AccomplishObjetive(gameState) {

    const unResolvedObjetivesLeft = () => gameState.unresolved > 1 ? gameState.unresolved - 1 : gameState.unresolved;

    gameState.objetives.pop();
    gameState.unresolved = unResolvedObjetivesLeft();
    return gameState;
  }

};

const newGameState = {
  id: 0,
  numBits: 0,
  unresolved: 1,
  started: false,
  playerList: [],
  playerTurn: 0,
  registers: {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  },
  objetives: []
};

const newPlayerState = {
  name: '',
  energy: 3
};

module.exports = gameStateManager;