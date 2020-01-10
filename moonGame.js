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

  const gameAPI = {
    EventStream: eventStream,

    async CreateGame(gameId, numBits, playerId) {

      let gameState = await store.get(gameId);
      if (gameState) {
        eventStream.next({ eventType: GameEvents.gameAlreadyCreated, gameId: gameId, playerId });
        return gameState;
      }

      gameState = StateManager.CreateNewGameState(gameId, playerId, numBits);
      await  store.set(gameId, gameState);  
      return gameState;
    },

    async JoinGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return gameState;
      }
      gameState = StateManager.JoinPlayer(gameState, playerId);

      if (gameState) { await store.set(gameId, gameState); }
      return gameState;
    },

    async LeaveGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return gameState;
      }

      gameState = StateManager.LeavePlayer(gameState, playerId);

      if (gameState) { await store.set(gameId, gameState); }
      return gameState;
    },

    async StartGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return gameState;
      }

      gameState = StateManager.StartGame(gameState, playerId);

      if (gameState) { await store.set(gameId, gameState);}
      return gameState;
    },

    async StatusGame(gameId, playerId) {
      const gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return gameState;
      }
      eventStream.next({ eventType: GameEvents.gameStatusConsulted, gameId: gameId, playerId });
      return gameState;
    },

    async EndPlayerTurn(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: GameEvents.gameNotCreated, gameId: gameId, playerId });
        return gameState;
      }

      gameState = StateManager.EndTurn(gameState, playerId);

      if (gameState) { await store.set(gameId, gameState); }
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
        return gameState;
      }
      
      gameState = StateManager.ExecuteBitOperation(gameState, playerId, RegisterOperations(gameState.numBits)[operation], Rules.OperationCost(operation), cpu_reg1, cpu_reg2);

      if (gameState) { await store.set(gameId, gameState); }
      return gameState;
    }
  };

  return gameAPI;
}

module.exports = Game;