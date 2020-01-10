const ObjetivesGenerator = require('./objetives');
const { Rules } = require('./gameRules');
const GameEvents = require('./gameEvents');
const { Subject } = require('rxjs');

const playerIs = (currentName) => (player) => player.name === currentName;
const playerIsNot = (currentName) => (player) => player.name !== currentName;

const eventStream = new Subject();

const gameStateManager = {

  EventStream: eventStream,

  CreateNewGameState(gameId, playerId, numBits) {

    var { registerValues, objetives } = ObjetivesGenerator(numBits);

    let gameState = Object.assign(
      { ...newGameState },
      {
        id: gameId,
        numBits: Rules.KeepNumBitsRange(numBits),
        playerList: new Array(),
        objetives: objetives,
        registers: Object.assign(
          { ...newRegisterState},
          {
            B: registerValues[0],
            C: registerValues[1],
            D: registerValues[2]
          })
      });

    this.EventStream.next({ eventType: GameEvents.gameCreated, gameId: gameState.id, playerId });
    gameState = this.JoinPlayer(gameState, playerId);

    return gameState;
  },

  JoinPlayer(gameState, playerId) {

    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

    if (gameState.started) {
      this.EventStream.next({ eventType: GameEvents.gameAlreadyStarted, gameId: gameState.id, playerId });
      return null;
    }

    if (alreadyJoined()) {
      this.EventStream.next({ eventType: GameEvents.playerAlreadyJoined, gameId: gameState.id, playerId });
      return null;
    }

    let playerState = Object.assign(
      { ...newPlayerState },
      {
        name: playerId
      });
 
    gameState.playerList.push(playerState);
    this.EventStream.next({ eventType: GameEvents.playerJoined, gameId: gameState.id, playerId });
    return gameState;
  },

  LeavePlayer(gameState, playerId) {

    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

    const ofPlayerLeaving = playerIs(playerId);
    const playerPosition = () => {
      const position = gameState.playerList.findIndex(ofPlayerLeaving);
      return position ? position : gameState.playerTurn;
    };
    const nexPlayerTurn = () => (playerPosition() < gameState.playerTurn) ? gameState.playerTurn - 1 : gameState.playerTurn;
    const playerLeaving = playerIsNot(playerId);
    const noPlayers = () => Rules.NoPlayersLeft(gameState);

    if (!alreadyJoined()) {
      this.EventStream.next({ eventType: GameEvents.playerNotJoined, gameId: gameState.id, playerId });
      return null;
    }

    gameState.playerList = gameState.playerList.filter(playerLeaving);
    gameState.playerTurn = nexPlayerTurn();

    this.EventStream.next({ eventType: GameEvents.playerLeft, gameId: gameState.id, playerId });

    if (noPlayers()) {
      this.EventStream.next({ eventType: GameEvents.noPlayersLeft, gameId: gameState.id, playerId });
      return null;
    }

    return gameState;
  },

  StartGame(gameState, playerId) {
    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);
    const alreadyStarted = () => gameState.started;

    if (!alreadyJoined()) {
      this.EventStream.next({ eventType: GameEvents.playerNotJoined, gameId: gameState.id, playerId });
      return null;
    }

    if (alreadyStarted()) {
      this.EventStream.next({ eventType: GameEvents.gameAlreadyStarted, gameId: gameState.id, playerId });
      return null;
    }

    gameState.started = true;
    this.EventStream.next({ eventType: GameEvents.gameStarted, gameId: gameState.id, playerId });
    return gameState;
  },

  EndTurn(gameState, playerId) {
    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);
    const endRound = () => Rules.LastPlayerPlaying(gameState);
    const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = Rules.MaxEnergy; return playerState; });
    const isCurrentPlayerTurn = () => Rules.IsPlayerTurn(gameState, playerId);
    const loose = () => Rules.MaxUnresolvedReached(gameState);

    if (!alreadyJoined()) {
      this.EventStream.next({ eventType: GameEvents.playerNotJoined, gameId: gameState.id, playerId });
      return gameState;
    }
    if (!gameState.started) {
      this.EventStream.next({ eventType: GameEvents.gameNotStarted, gameId: gameState.id, playerId });
      return null;
    }
    if (!isCurrentPlayerTurn()) {
      this.EventStream.next({ eventType: GameEvents.notPlayerTurn, gameId: gameState.id, playerId });
      return null;
    }

    if (endRound()) {
      gameState.playerTurn = 0;
      gameState.unresolved += 1;
      gameState.playerList = resetEnergy();
    }
    else { gameState.playerTurn += 1; }

    this.EventStream.next({ eventType: GameEvents.turnEnded, gameId: gameState.id, playerId });
    if (loose()) {
      this.EventStream.next({ eventType: GameEvents.gameLost, gameId: gameState.id, playerId });
      return null;
    }
    
    return gameState;
  },

  ExecuteBitOperation(gameState, playerId, operation, cost, reg1, reg2) {

    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);
    const isCurrentPlayerTurn = () => Rules.IsPlayerTurn(gameState, playerId);
    const enoughEnergy = () => Rules.CurrentPlayer(gameState).energy >= cost;
    const shouldEndTurn = () => Rules.NoEnergyLeft(gameState);
    const objetiveAccomplished = () => Rules.ObjetiveIsInRegA(gameState);
    const win = () => Rules.NoObjetivesLeft(gameState);
    const player = () => Rules.CurrentPlayer(gameState);

    if (!alreadyJoined()) {
      this.EventStream.next({ eventType: GameEvents.playerNotJoined, gameId: gameState.id, playerId });
      return null;
    }
    if (!gameState.started) {
      this.EventStream.next({ eventType: GameEvents.gameNotStarted, gameId: gameState.id, playerId });
      return null;
    }
    if (!isCurrentPlayerTurn()) {
      this.EventStream.next({ eventType: GameEvents.notPlayerTurn, gameId: gameState.id, playerId });
      return null;
    }
    if (!enoughEnergy()) {
      this.EventStream.next({ eventType: GameEvents.notEnoughEnergy, gameId: gameState.id, playerId });
      return null;
    }

    gameState.registers[reg1] = operation(gameState.registers[reg1], gameState.registers[reg2]);
    player().energy -= cost;

    this.EventStream.next({ eventType: GameEvents.operationApplied, gameId: gameState.id, playerId });

    if (objetiveAccomplished()) {
      gameState = this.AccomplishObjetive(gameState, playerId);
    }

    if (win()) {
      this.EventStream.next({ eventType: GameEvents.gameWon, gameId: gameState.id, playerId });
      return null;
    }

    if (shouldEndTurn()) {
      gameState = this.EndTurn(gameState, playerId);
    }

    return gameState;

  },

  AccomplishObjetive(gameState, playerId) {

    const unresolvedObjetivesLeft = () => gameState.unresolved > 1 ? gameState.unresolved - 1 : gameState.unresolved;

    gameState.objetives.pop();
    gameState.unresolved = unresolvedObjetivesLeft();

    this.EventStream.next({ eventType: GameEvents.objetiveAccomplished, gameId: gameState.id, playerId });
    return gameState;
  }

};

const newGameState = {
  numBits: 4, //potential overridable
  unresolved: 1,
  started: false,
  playerTurn: 0
};

const newRegisterState = {
  A: 0
};

const newPlayerState = {
  energy: Rules.MaxEnergy
};

module.exports = gameStateManager;