const ObjetivesGenerator = require('./objetives');
const { Rules } = require('./gameRules');
const GameEvents = require('./gameEvents');

const playerIs = (currentName) => (player) => player.name === currentName;
const playerIsNot = (currentName) => (player) => player.name !== currentName;

const gameStateManager = {

  CreateNewGameState(gameId, playerId, numBits) {

    let events = new Array();
    var { registerValues, objetives } = ObjetivesGenerator(numBits);

    let createdGameState = Object.assign(
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

    events.push(GameEvents.gameCreated);

    let { joinEvents, gameState } = this.JoinPlayer(createdGameState, playerId);
    events = events.concat(joinEvents);

    return { events, gameState };
  },

  JoinPlayer(gameState, playerId) {

    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

    if (gameState.started) { return { events: [GameEvents.gameAlreadyStarted], gameState }; }

    if (alreadyJoined()) { return { events: [GameEvents.playerAlreadyJoined], gameState }; }

    let playerState = Object.assign(
      { ...newPlayerState },
      {
        name: playerId
      });
   // playerState.name = playerId;
    gameState.playerList.push(playerState);

    return { events: [GameEvents.playerJoined], gameState };
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

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }

    gameState.playerList = gameState.playerList.filter(playerLeaving);
    gameState.playerTurn = nexPlayerTurn();

    const events = new Array();
    events.push(GameEvents.playerLeft);

    if (noPlayers()) { events.push(GameEvents.noPlayersLeft); }

    return { events, gameState };
  },

  StartGame(gameState, playerId) {
    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }

    gameState.started = true;
    return { events: [GameEvents.gameStarted], gameState };
  },

  EndTurn(gameState, playerId) {
    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);
    const endRound = () => Rules.LastPlayerPlaying(gameState);
    const resetEnergy = () => gameState.playerList.map((playerState) => { playerState.energy = Rules.MaxEnergy; return playerState; });
    const isCurrentPlayerTurn = () => Rules.IsPlayerTurn(gameState, playerId);
    const loose = () => Rules.MaxUnresolvedReached(gameState);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }
    if (!gameState.started) { return { events: [GameEvents.gameNotStarted], gameState }; }
    if (!isCurrentPlayerTurn()) { return { events: [GameEvents.notPlayerTurn], gameState }; }

    const events = new Array();

    if (endRound()) {
      gameState.playerTurn = 0;
      gameState.unresolved += 1;
      gameState.playerList = resetEnergy();
      if (loose()) { events.push(GameEvents.gameLost); }
    }
    else { gameState.playerTurn += 1; }

    events.push(GameEvents.turnEnded);
    
    return { events, gameState };
  },

  ExecuteBitOperation(gameState, playerId, operation, cost, reg1, reg2) {

    const alreadyJoined = () => Rules.PlayerIsInGame(gameState, playerId);
    const isCurrentPlayerTurn = () => Rules.IsPlayerTurn(gameState, playerId);
    const enoughEnergy = () => Rules.CurrentPlayer(gameState).energy >= cost;
    const shouldEndTurn = () => Rules.NoEnergyLeft(gameState);
    const objetiveAccomplished = () => Rules.ObjetiveIsInRegA(gameState);
    const win = () => Rules.NoObjetivesLeft(gameState);
    const loose = () => Rules.MaxUnresolvedReached(gameState);
    const player = () => Rules.CurrentPlayer(gameState);

    if (!alreadyJoined()) { return { events: [GameEvents.playerNotJoined], gameState }; }
    if (!gameState.started) { return { events: [GameEvents.gameNotStarted], gameState }; }
    if (!isCurrentPlayerTurn()) { return { events: [GameEvents.notPlayerTurn], gameState }; }
    if (!enoughEnergy()) { return { events: [GameEvents.notEnoughEnergy], gameState }; }

    gameState.registers[reg1] = operation(gameState.registers[reg1], gameState.registers[reg2]);
    player().energy -= cost;

    let events = new Array();
    events.push(GameEvents.operationApplied);

    if (objetiveAccomplished()) {
      gameState = this.AccomplishObjetive(gameState);
      events.push(GameEvents.objetiveAccomplished);
    }

    if (shouldEndTurn()) {
      let result = this.EndTurn(gameState, playerId);
      events = events.concat(result.events);
      gameState = result.gameState;
    }

    if (loose()) {
      events.push(GameEvents.gameLost);
      return { events, gameState };

    }

    if (win()) {
      events.push(GameEvents.gameWon);
      return { events, gameState };
    }

    return { events, gameState };

  },

  AccomplishObjetive(gameState) {

    const unresolvedObjetivesLeft = () => gameState.unresolved > 1 ? gameState.unresolved - 1 : gameState.unresolved;

    gameState.objetives.pop();
    gameState.unresolved = unresolvedObjetivesLeft();
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