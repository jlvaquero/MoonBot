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

const isPlayerTurn = (gameState, playerId) => gameState.playerList[gameState.playerTurn].name === playerId;

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

      if (!gameState) { return `${playerId}. Please, /creategame before joining on it.`; }
      if (gameState.started) { return `${playerId}. You can not join into an already started game.`; }

      gameState = StateManager.JoinPlayer(gameState, playerId);

      await store.set(gameId, gameState);
      return `\u{1F468}\u{200D}\u{1F680} ${playerId} has joined the game.`;
    },

    async LeaveGame(gameId, playerId) {

      const noPlayersLeft = () => gameState.playerList.length < 1;

      let result;
      let gameState = await store.get(gameId);
      if (!gameState) { return `${playerId}. There is no game to leave.`; }

      gameState = StateManager.LeavePlayer(gameState, playerId);

      if (noPlayersLeft()) {
        result = "Last player left the game.";
        result = result + ' ' + await this.CancelGame(gameId);
        return result;
      }
      await store.set(gameId, gameState);
      return `\u{1F468}\u{200D}\u{1F680} ${playerId} has left the game.`;
    },

    async StartGame(gameId) {
     
      let gameState = await store.get(gameId);
      if (!gameState) {
        return { message: `No game. Please, /creategame before start it.`, gameState };
      }

      gameState = StateManager.StartGame(gameState);

      await store.set(gameId, gameState);
      return { message: "Game has been started. \u{1F680} \u{1F314}", gameState };
    },

    async StatusGame(gameId) {

      const gameState = await store.get(gameId);
      return { message: gameState ? null : "No game. /creategame first.", gameState };

    },

    async EndPlayerTurn(gameId, playerId) {

      const isCurrentPlayerTurn = () => isPlayerTurn(gameState, playerId);
      const loose = () => gameState.unresolved === 5;

      let gameState = await store.get(gameId);

      if (!gameState) {
        return { message: "No game. /creategame first.", gameState};
      } 

      if (!gameState.started) {
        return { message: `${playerId}. The game has not been started. Please /startgame first.`, gameState };
      }

      if (!isCurrentPlayerTurn()) {
        return { message: `It is not your turn ${playerId}`, gameState};
      }

      gameState = StateManager.EndTurn(gameState);

      if (loose()) {
        await this.CancelGame(gameId);
        return { message: "You have been unable to complete the tasks.You crashed \u{1F4A5} \u{1F314} and died horrybly \u{1F480}.", gameState };
      }

      await store.set(gameId, gameState);

      return { message: `\u{1F468}\u{200D}\u{1F680} ${playerId} ends turn.`, gameState};
    },

    async CancelGame(gameId) {
      await store.del(gameId);
      return "Game has been cancelled.";
    },

    async ExecuteBitOperation(operation, gameId, playerId, register1, register2, ) {

      const isCurrentPlayerTurn = () => isPlayerTurn(gameState, playerId);
      const enoughEnergy = () => gameState.playerList[gameState.playerTurn].energy >= OperationCost[operation];
      const shouldEndTurn = () => gameState.playerList[gameState.playerTurn].energy === 0;
      const objetiveAccomplished = () => gameState.registers.A === gameState.objetives[gameState.objetives.length - 1];
      const win = () => gameState.objetives.length === 0;
      const loose = () => gameState.unresolved === 5;

      let gameState = await store.get(gameId);
    
      if (!gameState) {
        return { messages: ["No game. /creategame first."], gameState };
      }

      if (!gameState.started) {
        return { message: [`${playerId}. The game has not been started. Please /startgame first.`], gameState };
      }

      if (!isCurrentPlayerTurn()) {
        return { messages: [`It is not your turn ${playerId}`], gameState: gameState };
      }

      if (!enoughEnergy()) {
        return { messages: [`You do not have enough energy for ${operation} operation ${playerId}`], gameState };
      }

      gameState = StateManager.ExecuteBitOperation(gameState, RegisterOperations(gameState.numBits)[operation], OperationCost[operation], register1, register2);

      let messages = new Array();
      messages.push(`${operation} operation applied.`);

      if (objetiveAccomplished()) {
        gameState = StateManager.AccomplishObjetive(gameState);
       
        messages.push("\u{2714} Objective accomplished.");
      }
      if (shouldEndTurn()) {
        gameState = StateManager.EndTurn(gameState);
        messages.push(`\u{1F468}\u{200D}\u{1F680} ${playerId} ends turn.`);
      }

      if (loose()) {
        await this.CancelGame(gameId);
        messages.push("You have been unable to complete the tasks.You crashed \u{1F4A5} \u{1F314} and died horrybly \u{1F480}.");
      }

      if (win()) {
        await this.CancelGame(gameId);
        messages.push("\u{1F389} Congratulations.\u{1F38A} All objetives completed. You landed successful on the surface of the moon.");
      }

      await store.set(gameId, gameState);

      return { messages: messages, gameState };
    }

  };

}

module.exports = Game;