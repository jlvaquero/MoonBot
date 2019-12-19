const StateManager = require('./gameStateManager');
const RegisterOperations = require('./registerOperations');
const utils = require('./utils');

const OperationCost = {
  inc: 2,
  dec: 2,
  rol: 1,
  ror: 1,
  mov: 1,
  not: 1,
  or: 0.5,
  and: 0.5,
  xor: 0.5
};

const Cpu_Bits = {
  min: 4,
  max: 6
};

function Game(store) {

  //const store = stateStore;

  return {
    async CreateGame(gameId, numBits, playerId) {

      const keepNumBitsRange = (bitsNum) => utils.Clamp(bitsNum, Cpu_Bits.min, Cpu_Bits.max);

      numBits = keepNumBitsRange(numBits);
      let gameState = await store.get(gameId);

      if (gameState) { return "A game is currently in progress."; }

      gameState = StateManager.CreateNewGameState(gameId, playerId, numBits);

      store.set(gameId, gameState);
      return "Game created. Other group members can /joingame .";
    },
    async JoinGame(gameId, playerId) {
      let gameState = await store.get(gameId);
      if (!gameState) { return "Please, /create a game before joining on it."; }
      if (gameState.started) { return "You can not join into an already started game!"; }

      await store.set(gameId, StateManager.JoinPlayer(gameState, playerId));

      return playerId + " has joined the game.";
    },
    async LeaveGame(gameId, playerId) {

      const noPlayersLeft = () => gameState.playerList.length < 1;

      let result;
      let gameState = await store.get(gameId);
      if (!gameState) { return "Please, /join a game before leave it."; }

      gameState = StateManager.LeavePlayer(gameState, playerId);

      if (noPlayersLeft()) {
        result = "Last player left the game.";
        result = result + ' ' + await this.CancelGame(gameId);
        return result;
      }
      await store.set(gameId, gameState);
      return `${playerId} has left the game.`;
    },
    async StartGame(gameId) {
      let gameState = await store.get(gameId);

      gameState = StateManager.StartGame(gameState);

      await store.set(gameId, gameState);
      return { message: "Game has been started.", gameState };
    },
    async StatusGame(gameId) {

      const gameState = await store.get(gameId);
      return { message: gameState ? null : "No game. /creategame first.", gameState };

    },
    async EndPlayerTurn(gameId, playerId) {
      let gameState = await store.get(gameId);

      gameState = StateManager.EndTurn(gameState);

      await store.set(gameId, gameState);

      return { message: `${playerId} ends turn.`, gameState };
    },
    async CancelGame(gameId) {
      await store.del(gameId);
      return "Game has been cancelled.";
    },
    async ExecuteBitOperation(gameId, playerId, operation, register1, register2) {

      const isPlayerTurn = () => gameState.playerList[gameState.playerTurn].name === playerId;
      const enoughEnergy = () => gameState.playerList[gameState.playerTurn].energy >= OperationCost.inc;
      const shouldEndTurn = () => gameState.playerList[gameState.playerTurn].energy === 0;
      const objetiveAccomplished = () => gameState.registers.A === gameState.objetives[gameState.objetives.length - 1];
      const win = () => gameState.objetives.length === 0;
      const loose = () => gameState.unresolved === 5;

      let gameState = await store.get(gameId);
      if (!isPlayerTurn()) { return `It is not your turn ${playerId}`; }
      if (!enoughEnergy()) { return `You do not have enough energy for ${operation} operation ${playerId}`; }

      gameState = StateManager.ExecuteBitOperation(gameState, RegisterOperations(gameState.numBits)[operation], OperationCost[operation], register1, register2);

      if (objetiveAccomplished()) {
        gameState = StateManager.AccomplishObjetive(gameState);
      }
      if (win()) {
        return "Congratulations. All objetives completed. You landed succeful on the surface of the moon.";
      }

      if (shouldEndTurn()) {
        gameState = await this.EndPlayerTurn(gameId, playerId);
        if (loose()) {
          await this.CancelGame(gameId);
          return "You crash and died horrybly";
        }
      }

      await store.set(gameId, gameState);

      return operation + "operation applied.";
    }
  };
}
module.exports = Game;