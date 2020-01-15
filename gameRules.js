const utils = require('./utils');

const Cpu_Bits = {
  min: 4,
  max: 6
};

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

const defaultEnergy = 3;

const Rules = {
  KeepNumBitsRange(bitsNum) { return utils.Clamp(bitsNum, Cpu_Bits.min, Cpu_Bits.max); },
  CurrentPlayer(gameState) { return gameState.playerList[gameState.playerTurn]; },
  IsPlayerTurn(gameState, playerId) { return this.CurrentPlayer(gameState).name === playerId; },
  PlayerIsInGame(gameState, playerId) { return gameState.playerList.findIndex((player) => player.name === playerId) === -1 ? false : true; },
  NoPlayersLeft(gameState) { return gameState.playerList.length < 1; },
  MaxUnresolvedReached(gameState) { return gameState.unresolved === 5; },
  NoObjetivesLeft(gameState) { return gameState.objetives.length === 0; },
  EnoughEnergyFor(gameState, operation) { return this.CurrentPlayer(gameState).energy >= this.OperationCost(operation); },
  ObjetiveIsInRegA(gameState) { return gameState.registers.A === gameState.objetives[gameState.objetives.length - 1]; },
  NoEnergyLeft(gameState) { return this.CurrentPlayer(gameState).energy === 0; },
  NoUnresolvedLeft(gameState) { return gameState.unresolved === 0;},
  OperationCost(op) { return OperationCost[op]; },
  LastPlayerPlaying(gameState) { return gameState.playerTurn === gameState.playerList.length - 1; },
  KeepMaxEnergyInRange(energy) {
    energy = Number(energy);
    if (energy !== 1.5 && energy !== 2 && energy !== 2.5 && energy !== 3) {
      return defaultEnergy; //fallback value
    }
    return energy;
  }
};

const OperationCode = {
  inc: "inc",
  dec: "dec",
  rol: "rol",
  ror: "ror",
  mov: "mov",
  not: "not",
  or: "or",
  and: "and",
  xor: "xor"
};

module.exports.Rules = Rules;
module.exports.OperationCode = OperationCode;
