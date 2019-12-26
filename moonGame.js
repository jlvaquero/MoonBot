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

  return {
    async CreateGame(gameId, numBits, playerId) {

      const keepNumBitsRange = (bitsNum) => utils.Clamp(bitsNum, Cpu_Bits.min, Cpu_Bits.max);

      numBits = keepNumBitsRange(numBits);

      let gameState = await store.get(gameId);

      if (gameState) { return "A game is currently in progress."; }

      gameState = StateManager.CreateNewGameState(gameId, playerId, numBits);

      store.set(gameId, gameState);
      return "Game created. Now, other group members can /joingame .";

    },

    async JoinGame(gameId, playerId) {
      let gameState = await store.get(gameId);
      if (!gameState) { return "Please, /creategame before joining on it."; }
      if (gameState.started) { return "You can not join into an already started game!"; }

      gameState = StateManager.JoinPlayer(gameState, playerId);

      await store.set(gameId, gameState);
      return `${playerId} has joined the game.`;
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
      let message;
      let gameState = await store.get(gameId);
      if (!gameState) {
        message = "Please, /creategame before stat it.";
        return { message: message, gameState: gameState };
      }

      gameState = StateManager.StartGame(gameState);

      await store.set(gameId, gameState);
      return { message: "Game has been started.", gameState };
    },

    async StatusGame(gameId) {

      const gameState = await store.get(gameId);
      return { message: gameState ? null : "No game. /creategame first.", gameState };

    },

    async EndPlayerTurn(gameId, playerId) {

      const loose = () => gameState.unresolved === 5;

      let gameState = await store.get(gameId);

      gameState = StateManager.EndTurn(gameState);
      if (loose()) {
        gameState = StateManager.LooseGame(gameState);
        await this.CancelGame(gameId);
        message = "You crash and died horrybly";
        return { message: message, gameState: gameState };
      }

      await store.set(gameId, gameState);

      return { message: `${playerId} ends turn.`, gameState: gameState };
    },

    async CancelGame(gameId) {
      await store.del(gameId);
      return "Game has been cancelled.";
    },

    async ExecuteBitOperation(operation, gameId, playerId, register1, register2, ) {

      const isPlayerTurn = () => gameState.playerList[gameState.playerTurn].name === playerId;
      const enoughEnergy = () => gameState.playerList[gameState.playerTurn].energy >= OperationCost[operation];
      const shouldEndTurn = () => gameState.playerList[gameState.playerTurn].energy === 0;
      const objetiveAccomplished = () => gameState.registers.A === gameState.objetives[gameState.objetives.length - 1];
      const win = () => gameState.objetives.length === 0;
      const loose = () => gameState.unresolved === 5;

      let gameState = await store.get(gameId);
      let message;

      if (!isPlayerTurn()) {
        message = `It is not your turn ${playerId}`;
        return { message: message, gameState: gameState };
      }
      if (!enoughEnergy()) {
        message = `You do not have enough energy for ${operation} operation ${playerId}`;
        return { message: message, gameState: gameState };
      }

      gameState = StateManager.ExecuteBitOperation(gameState, RegisterOperations(gameState.numBits)[operation], OperationCost[operation], register1, register2);

      if (objetiveAccomplished()) {
        gameState = StateManager.AccomplishObjetive(gameState);
      }
      if (win()) {
        gameState = StateManager.WinGame(gameState);
        await this.CancelGame(gameId);
        message = "Congratulations. All objetives completed. You landed successful on the surface of the moon.";
        return { message: message, gameState: gameState };
      }

      if (shouldEndTurn()) {
        gameState = StateManager.EndTurn(gameState);
        if (loose()) {
          gameState = StateManager.LooseGame(gameState);
          await this.CancelGame(gameId);
          message = "You crashed and died horrybly.";
          return { message: message, gameState: gameState };
        }
      }

      await store.set(gameId, gameState);

      message = `${operation} operation applied.`;
      return { message: message, gameState: gameState };
    }

  };

}

module.exports = Game;