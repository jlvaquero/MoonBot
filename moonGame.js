const StateManager = require('./gameStateManager');
const RegisterOperations = require('./registerOperations');
const { Rules } = require('./gameRules');
const GameEvents = require('./gameEvents');

function Game(store) {

  return {
    async CreateGame(gameId, numBits, playerId) {

      const prevGameState = await store.get(gameId);
      if (prevGameState) { return { events: [GameEvents.gameAlreadyCreated], gameState: prevGameState }; }

      const { events, gameState } = StateManager.CreateNewGameState(gameId, playerId, numBits);
      await  store.set(gameId, gameState);  
      return { events, gameState };
    },

    async JoinGame(gameId, playerId) {

      const prevGameState = await store.get(gameId);
      if (!prevGameState) { return { events: [GameEvents.gameNotCreated], gameState: prevGameState }; }

      const { events, gameState } = StateManager.JoinPlayer(prevGameState, playerId);
      await store.set(gameId, gameState);
      return { events, gameState };
    },

    async LeaveGame(gameId, playerId) {

      const noPlayerLeftEvent = (event) => event === GameEvents.noPlayersLeft;
      const noPlayers = () => events.find(noPlayerLeftEvent);

      const prevGameState = await store.get(gameId);
      if (!prevGameState) { return { events: [GameEvents.gameNotCreated], gameState: prevGameState }; }

      const { events, gameState } = StateManager.LeavePlayer(prevGameState, playerId);

      if (noPlayers()) {
        const result = await this.CancelGame(gameId);
        return { events: events.concat(result.events), gameState: result.gameState };
      }

      await store.set(gameId, gameState);
      return { events, gameState };
    },

    async StartGame(gameId, playerId) {

      const prevGameState = await store.get(gameId);
      if (!prevGameState) { return { events: [GameEvents.gameNotCreated], gameState: prevGameState }; }

      const { events, gameState } = StateManager.StartGame(prevGameState, playerId);

      await store.set(gameId, gameState);
      return { events, gameState };
    },

    async StatusGame(gameId) {
      const gameState = await store.get(gameId);
      return { events: gameState ? [GameEvents.gameStatusConsulted] : [GameEvents.gameNotCreated], gameState };
    },

    async EndPlayerTurn(gameId, playerId) {

      const looseGameEvent = (event) => event === GameEvents.gameLost;
      const loose = () => events.find(looseGameEvent);

      const prevGameState = await store.get(gameId);
      if (!prevGameState) { return { events: [GameEvents.gameNotCreated], gameState: prevGameState }; }

      const { events, gameState } = StateManager.EndTurn(prevGameState, playerId);

      if (loose()) {
        const result = await this.CancelGame(gameId);
        return { events: events.concat(result.events), gameState: result.gameState };
      }

      await store.set(gameId, gameState);
      return { events, gameState };
    },

    async CancelGame(gameId) {
      await store.del(gameId);
      return { events: [GameEvents.gameCancelled], gameState: null };
    },

    async ExecuteBitOperation(operation, gameId, playerId, cpu_reg1, cpu_reg2) {

      const looseGameEvent = (event) => event === GameEvents.gameLost;
      const loose = () => events.find(looseGameEvent);
      const wonGameEvent = (event) => event === GameEvents.gameWon;
      const won = () => events.find(wonGameEvent);

      const prevGameState = await store.get(gameId);
      if (!prevGameState) { return { events: [GameEvents.gameNotCreated], gameState: prevGameState }; }

      const { events, gameState } = StateManager.ExecuteBitOperation(prevGameState, playerId, RegisterOperations(prevGameState.numBits)[operation], Rules.OperationCost(operation), cpu_reg1, cpu_reg2);

      if (loose() || won()) {
        const result = await this.CancelGame(gameId);
        return { messages: events.concat(result.events), gameState: result.gameState };
      }
 
      await store.set(gameId, gameState);
      return { events, gameState };
    }
  };

}

module.exports = Game;