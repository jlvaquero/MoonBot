const StateManager = require('./gameStateManager');
const EngineEvents = require('./engineEvents');
const { filter } = require('rxjs/operators');
const { nullable } = require('pratica');

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
    next(event) {
      gameAPI.CancelGame(event.gameState.id, event.playerId);
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

    async CreateGame(gameId, playerId, numBits, numBugs, maxEnergy, useEvents) {

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

      const gameState = nullable(await store.get(gameId));

      return gameState
        .cata({
          Nothing: () => {
            eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
            return nullable();
          },
          Just: _ => gameState
        })
        .chain(gameState => nullable(StateManager.JoinPlayer({ gameState, playerId }).gameState));
    },

    async LeaveGame(gameId, playerId) {

      const gameState = nullable(await store.get(gameId));

      return gameState
        .cata({
          Nothing: () => {
            eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
            return nullable();
          },
          Just: _ => gameState
        })
        .chain(gameState => nullable(StateManager.LeavePlayer({ gameState, playerId }).gameState));

    },

    async StartGame(gameId, playerId) {

      const gameState = nullable(await store.get(gameId));

      return gameState
        .cata({
          Nothing: () => {
            eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
            return nullable();
          },
          Just: _ => gameState
        })
        .chain(gameState => nullable(StateManager.StartGame({ gameState, playerId }).gameState));

    },

    async StatusGame(gameId, playerId) {

      const gameState = nullable(await store.get(gameId));

      gameState
        .cata({
          Just: gameState => eventStream.next({ eventType: EngineEvents.gameStatusConsulted, gameState, playerId }),
          Nothing: () => eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId })
        });

      return gameState;
    },

    async EndPlayerTurn(gameId, playerId) {

      const gameState = nullable(await store.get(gameId));

      return gameState
        .cata({
          Nothing: () => {
            eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
            return nullable();
          },
          Just: _ => gameState
        })
        .chain(gameState => nullable(StateManager.EndTurn({ gameState, playerId }).gameState));
    },

    async CancelGame(gameId, playerId) {

      const gameState = nullable(await store.get(gameId));

      gameState
        .cata({
          Just: _ => store.del(gameId).then(eventStream.next({ eventType: EngineEvents.gameCancelled, gameState: { id: gameId }, playerId })),
          Nothing: () => eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId })
        });

       return gameState;
    },

    async ExecuteBitOperation(operation, gameId, playerId, cpu_reg1, cpu_reg2) {

      const gameState = nullable(await store.get(gameId));

      return gameState
        .cata({
          Nothing: () => {
            eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
            return nullable();
          },
          Just: _ => gameState
        })
        .chain(gameState => nullable(StateManager.ExecuteBitOperation({ gameState, playerId, operation, cpu_reg1, cpu_reg2 }).gameState));
    },

    async FixError(gameId, playerId, _, error) {

      const gameState = nullable(await store.get(gameId));

      return gameState
        .cata({
          Nothing: () => {
            eventStream.next({ eventType: EngineEvents.gameNotCreated, gameId: gameId, playerId });
            return nullable();
          },
          Just: _ => gameState
        })
        .chain(gameState => nullable(StateManager.fixError({ gameState, playerId, error }).gameState));
    },

    async Quit() {
      eventStream.complete();
      return await store.quit();
    }
  };

  return gameAPI;
}

module.exports = Game;
