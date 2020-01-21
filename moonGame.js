const StateManager = require('./gameStateManager');
const EngineEvents = require('./engineEvents');
const { filter } = require('rxjs/operators');

function Game(store) {

  //obtain state manager event stream
 const eventStream = StateManager.EventStream;

  //react on events that needs game to be cancelled
  const cancellGameEvents = eventStream.pipe(
    filter(
      event =>
        event.eventType === EngineEvents.gameLost ||
        event.eventType === EngineEvents.gameWon ||
        event.eventType === EngineEvents.noPlayersLeft
    ));

  cancellGameEvents.subscribe({
    async next(event) {
      await gameAPI.CancelGame(event.gameState.id, event.playerId);
      }
  });

  //react on game state changed; just store the new state
  const stateChangedEvent = eventStream.pipe(filter(event => event.eventType === EngineEvents.gameStatusChanged));
  stateChangedEvent.subscribe({
    async next(event) {
      await store.set(event.gameState.id, event.gameState);
    }
  });

  const gameAPI = {
    EventStream: eventStream, //allows consumer to capture the event stream

    async CreateGame(gameId, playerId, numBits, numBugs, maxEnergy, useEvents ) {

      //do not let create a new game if one already existe
      let gameState = await store.get(gameId);
      if (gameState) {
        eventStream.next({ eventType: EngineEvents.gameAlreadyCreated, gameState, playerId });
        return null;
      }

      //incomplete request
      if (!numBits) {
          eventStream.next({ eventType: EngineEvents.gameNumBitsMissed, gameId, playerId }); //notify it by event
          return null;
      }
      if (!numBugs) {
        eventStream.next({ eventType: EngineEvents.gameNumBugsMissed, gameId, playerId, numBits });
        return null;
      }
      if (!maxEnergy) {
        eventStream.next({ eventType: EngineEvents.gameMaxEnergyMissed, gameId, playerId, numBits, numBugs });
        return null;
      }
      if (!useEvents) {
        eventStream.next({ eventType: EngineEvents.gameUseEventsMissed, gameId, playerId, numBits, numBugs, maxEnergy });
        return null;
      }

      //complete request. create the new game and return it
      gameState = StateManager.CreateNewGameState({ gameId, playerId, numBits, numBugs, maxEnergy, useEvents }).gameState;
      return gameState;
    },

    async JoinGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.JoinPlayer({ gameState, playerId }).gameState;
      return gameState;
    },

    async LeaveGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.LeavePlayer({ gameState, playerId }).gameState;
      return gameState;
    },

    async StartGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.StartGame({ gameState, playerId }).gameState;
      return gameState;
    },

    async StatusGame(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      eventStream.next({ eventType: EngineEvents.gameStatusConsulted, gameState, playerId });
      return gameState;
    },

    async EndPlayerTurn(gameId, playerId) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.EndTurn({ gameState, playerId }).gameState;
      return gameState;
    },

    async CancelGame(gameId, playerId) {
      await store.del(gameId);
      eventStream.next({ eventType: EngineEvents.gameCancelled, gameState: { id: gameId }, playerId });
    },

    async ExecuteBitOperation(operation, gameId, playerId, cpu_reg1, cpu_reg2) {

      let gameState = await store.get(gameId);
      if (!gameState) {
        eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
        return null;
      }

      gameState = StateManager.ExecuteBitOperation({ gameState, playerId, operation, cpu_reg1, cpu_reg2 }).gameState;

      return gameState;
    }
  };

  return gameAPI;
}

module.exports = Game;
