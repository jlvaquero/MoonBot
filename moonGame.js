const StateManager = require('./gameStateManager');
const RegisterOperations = require('./registerOperations');
const GameRules = require('./gameRules');

function Game(store) {
   
  return {
    async CreateGame(gameId, numBits, playerId) {

      let gameState = await store.get(gameId);

      if (gameState) { return "A game is currently in progress."; }
          
      numBits = GameRules.KeepNumBitsRange(numBits);

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

      const noPlayers = () => GameRules.NoPlayersLeft(gameState);
      
      let result;
      let gameState = await store.get(gameId);
      if (!gameState) { return `${playerId}. There is no game to leave.`; }
      
      gameState = StateManager.LeavePlayer(gameState, playerId);

      if (noPlayers()) {
        result = "Last player left the game.";
        result = result + ' ' + await this.CancelGame(gameId);
        return result;
      }
      await store.set(gameId, gameState);
      return `\u{1F468}\u{200D}\u{1F680} ${playerId} has left the game.`;
    },

    async StartGame(gameId) {
     
      let gameState = await store.get(gameId);
      if (!gameState) { return { message: `No game. Please, /creategame before start it.`, gameState }; }

      gameState = StateManager.StartGame(gameState);

      await store.set(gameId, gameState);
      return { message: "Game has been started. \u{1F680} \u{1F314}", gameState };
    },

    async StatusGame(gameId) {

      const gameState = await store.get(gameId);
      return { message: gameState ? null : "No game. /creategame first.", gameState };

    },

    async EndPlayerTurn(gameId, playerId) {

      const isCurrentPlayerTurn = () => GameRules.IsPlayerTurn(gameState, playerId);
      const loose = () => GameRules.MaxUnresolvedReached(gameState);

      let gameState = await store.get(gameId);

      if (!gameState) { return { message: "No game. /creategame first.", gameState }; }

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

    async ExecuteBitOperation(operation, gameId, playerId, register1, register2) {

      const isCurrentPlayerTurn = () => GameRules.IsPlayerTurn(gameState, playerId);
      const enoughEnergy = () => GameRules.EnoughEnergyFor(gameState, operation);
      const shouldEndTurn = () => GameRules.NoEnergyLeft(gameState);
      const objetiveAccomplished = () => GameRules.ObjetiveIsInRegA(gameState);
      const win = () => GameRules.NoObjetivesLeft(gameState);
      const loose = () => GameRules.MaxUnresolvedReached(gameState);

      let gameState = await store.get(gameId);
    
      if (!gameState) { return { messages: ["No game. /creategame first."], gameState }; }
      const rules = GameRules(gameState);
    
      if (!gameState.started) {
        return { messages: [`${playerId}. The game has not been started. Please /startgame first.`], gameState };
      }

      if (!isCurrentPlayerTurn()) {
        return { messages: [`It is not your turn ${playerId}`], gameState };
      }

      if (!enoughEnergy()) {
        return { messages: [`You do not have enough energy for ${operation} operation ${playerId}`], gameState };
      }

      gameState = StateManager.ExecuteBitOperation(gameState, RegisterOperations(gameState.numBits)[operation], GameRules.OperationCost(operation), register1, register2);

      let messages = new Array();
      messages.push(`${operation} operation applied.`);

      if (objetiveAccomplished()) {
        gameState = StateManager.AccomplishObjetive(gameState);
        messages.push("\u{2705} Objective accomplished.");
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