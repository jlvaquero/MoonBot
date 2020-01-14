const StateManager = require('./gameStateManager');
const RegisterOperations = require('./registerOperations');
const { Rules } = require('./gameRules');
const GameEvents = require('./gameEvents');
const { filter } = require('rxjs/operators');

function Game(store) {

 const eventStream = StateManager.EventStream;

  const cancellGameEvents = eventStream.pipe(filter(event => (event.eventType === GameEvents.gameLost) || (event.eventType === GameEvents.gameWon) || event.eventType === GameEvents.noPlayersLeft));
  cancellGameEvents.subscribe({
    async next(event) {
      await gameAPI.CancelGame(event.gameId, event.playerId);
      }
  });

  const stateChangedEvent = eventStream.pipe(filter(event => event.eventType === GameEvents.gameStatusChanged));
  stateChangedEvent.subscribe({
    async next(event) {
      await store.set(event.gameState.id, event.gameState);
    }
  });

  const gameAPI = {
    EventStream: eventStream,

    async CreateGame(gameId, numBits, playerId) {

      let gameState = await store.get(gameId);
      if (gameState) {
        eventStream.next({ eventType: GameEvents.gameAlreadyCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.CreateNewGameState({ gameId, playerId, numBits }).gameState;
      return gameState;
    },

    async JoinGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.JoinPlayer({ gameState, playerId }).gameState;
      return gameState;
    },

    async LeaveGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.LeavePlayer({ gameState, playerId }).gameState;
      return gameState;
    },

    async StartGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.StartGame({ gameState, playerId }).gameState;
      return gameState;
    },

    async StatusGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      eventStream.next({ eventType: GameEvents.gameStatusConsulted, gameId: gameId, playerId });
      return gameState;
    },

    async EndPlayerTurn(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.EndTurn({ gameState, playerId }).gameState;
      return gameState;
    },

    async CancelGame(gameId, playerId) {
      await store.del(gameId);
      eventStream.next({ eventType: GameEvents.gameCancelled, gameId: gameId, playerId });
    },

    async ExecuteBitOperation(operation, gameId, playerId, cpu_reg1, cpu_reg2) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }
      
      gameState = StateManager.ExecuteBitOperation({ gameState, playerId, operation: RegisterOperations(gameState.numBits)[operation], cost: Rules.OperationCost(operation), cpu_reg1, cpu_reg2 }).gameState;

      return gameState;
    }
  };

  return gameAPI;
}

module.exports = Game;