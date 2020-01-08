const StateManager = require('./gameStateManager');
const RegisterOperations = require('./registerOperations');
const GameRules = require('./gameRules');
const GameEvents = require('./gameEvents');

const eventsToMesagges = (messages, event) => {
  messages.push(GameEvents.eventMessages[event]);
  return messages;
};

function Game(store) {

  return {
    async CreateGame(gameId, numBits, playerId) {

      let prevGameState = await store.get(gameId);
      if (prevGameState) { return { messages: [GameEvents.eventMessages[GameEvents.gameAlreadyCreated]], gameState: prevGameState }; }

      let { events, gameState } = StateManager.CreateNewGameState(gameId, playerId, numBits);

      let storing = store.set(gameId, gameState);
      const messages = events.reduce(eventsToMesagges, new Array());
      await storing;
      return { messages, gameState };
    },

    async JoinGame(gameId, playerId) {

      let prevGameState = await store.get(gameId);
      if (!prevGameState) { return { messages: [GameEvents.eventMessages[GameEvents.gameNotCreated]], gameState: prevGameState }; }

      let { events, gameState } = StateManager.JoinPlayer(prevGameState, playerId);

      let storing = store.set(gameId, gameState);
      messages = events.reduce(eventsToMesagges, new Array());
      await storing;
      return { messages, gameState };
    },

    async LeaveGame(gameId, playerId) {

      const noPlayerLeftEvent = (event) => event === GameEvents.noPlayersLeft;
      const noPlayers = () => events.find(noPlayerLeftEvent);

      let prevGameState = await store.get(gameId);
      if (!prevGameState) { return { messages: [GameEvents.eventMessages[GameEvents.gameNotCreated]], gameState: prevGameState }; }

      let { events, gameState } = StateManager.LeavePlayer(prevGameState, playerId);

      if (noPlayers()) {
        let result = await this.CancelGame(gameId);
        return { messages: events.reduce(eventsToMesagges, new Array()).concat(result.messages), gameState: result.gameState };
      }

      let storing = store.set(gameId, gameState);
      const messages = events.reduce(eventsToMesagges, new Array());
      await storing;
      return { messages, gameState };
    },

    async StartGame(gameId, playerId) {

      let prevGameState = await store.get(gameId);
      if (!prevGameState) { return { messages: [GameEvents.eventMessages[GameEvents.gameNotCreated]], gameState: prevGameState }; }

      let { events, gameState } = StateManager.StartGame(prevGameState, playerId);

      let storing = store.set(gameId, gameState);
      const messages = events.reduce(eventsToMesagges, new Array());
      await storing;
      return { messages, gameState };
    },

    async StatusGame(gameId) {

      const gameState = await store.get(gameId);
      return { messages: gameState ? new Array() : [GameEvents.eventMessages[GameEvents.gameNotCreated]], gameState };
    },

    async EndPlayerTurn(gameId, playerId) {

      const looseGameEvent = (event) => event === GameEvents.gameLost;
      const loose = () => events.find(looseGameEvent);

      let prevGameState = await store.get(gameId);
      if (!prevGameState) { return { messages: [GameEvents.eventMessages[GameEvents.gameNotCreated]], gameState: prevGameState }; }

      let { events, gameState } = StateManager.EndTurn(prevGameState, playerId);

      if (loose()) {
        let result = await this.CancelGame(gameId);
        return { messages: events.reduce(eventsToMesagges, new Array()).concat(result.messages), gameState: result.gameState };
      }

      let storing = store.set(gameId, gameState);
      const messages = events.reduce(eventsToMesagges, new Array());
      await storing;
      return { messages, gameState };
    },

    async CancelGame(gameId) {
      await store.del(gameId);
      return { messages: [GameEvents.eventMessages[GameEvents.gameCancelled]], gameState: null };
    },

    async ExecuteBitOperation(operation, gameId, playerId, register1, register2) {

      const looseGameEvent = (event) => event === GameEvents.gameLost;
      const loose = () => events.find(looseGameEvent);
      const wonGameEvent = (event) => event === GameEvents.gameWon;
      const won = () => events.find(wonGameEvent);

      let prevGameState = await store.get(gameId);
      if (!prevGameState) { return { messages: [GameEvents.eventMessages[GameEvents.gameNotCreated]], gameState: prevGameState }; }

      let { events, gameState } = StateManager.ExecuteBitOperation(prevGameState, playerId, RegisterOperations(prevGameState.numBits)[operation], GameRules.OperationCost(operation), register1, register2);

      if (loose() || won()) {
        let result = await this.CancelGame(gameId);
        events.concat(result.events);
        return { messages: events.reduce(eventsToMesagges, new Array()), gameState: result.gameState };
      }
 
      let storing = store.set(gameId, gameState);
      const messages = events.reduce(eventsToMesagges, new Array());
      await storing;
      return { messages, gameState };
    }

  };

}

module.exports = Game;