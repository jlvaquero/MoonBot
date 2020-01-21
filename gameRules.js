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

const CardType = {
  Objetive: Symbol.for("OBJETIVE"),
  Bug: Symbol.for("BUG"),
  Event: Symbol.for("GAME_EVENT")
};

const GameEventType = {
  ResetA: Symbol.for("RESET_A_GAME_EVENT"),
  ResetB: Symbol.for("RESET_B_GAME_EVENT"),
  ResetC: Symbol.for("RESET_C_GAME_EVENT"),
  ResetD: Symbol.for("RESET_D_GAME_EVENT"),
  Ok: Symbol.for("OK_GAME_EVENT"),
  ErrorB: Symbol.for("ERROR_B_GAME_EVENT"),
  ErrorC: Symbol.for("ERROR_C_GAME_EVENT"),
  ErrorD: Symbol.for("ERROR_D_GAME_EVENT"),
  ErrorROL: Symbol.for("ERROR_ROL_GAME_EVENT"),
  ErrorXOR: Symbol.for("ERROR_XOR_GAME_EVENT"),
  ErrorNOT: Symbol.for("ERROR_NOT_GAME_EVENT")
};

const Rules = {
  KeepNumBitsRange(bitsNum) { return utils.Clamp(bitsNum, Cpu_Bits.min, Cpu_Bits.max); },
  CurrentPlayer(gameState) { return gameState.playerList[gameState.playerTurn]; },
  IsPlayerTurn(gameState, playerId) { return this.CurrentPlayer(gameState).name === playerId; },
  PlayerIsInGame(gameState, playerId) { return gameState.playerList.some((player) => player.name === playerId); },
  NoPlayersLeft(gameState) { return gameState.playerList.length < 1; },
  MaxUnresolvedReached(gameState) { return gameState.unresolved + gameState.bugsFound === this.MaxUnresolvedValue; },
  NoObjetivesLeft(gameState) { return gameState.objetives.length === 0 && !gameState.currentObjetive; },
  EnoughEnergyFor(gameState, operation) { return this.CurrentPlayer(gameState).energy >= this.OperationCost(operation); },
  ObjetiveIsInRegA(gameState) { return gameState.registers.A === gameState.currentObjetive.value; },
  NoEnergyLeft(gameState) { return this.CurrentPlayer(gameState).energy === 0; },
  NoUnresolvedLeft(gameState) { return gameState.unresolved === 0; },
  OperationCost(op) { return OperationCost[op]; },
  LastPlayerPlaying(gameState) { return gameState.playerTurn === gameState.playerList.length - 1; },
  KeepMaxEnergyInRange(energy) {
    energy = Number(energy);
    if (energy !== 1.5 && energy !== 2 && energy !== 2.5 && energy !== 3) {
      return defaultEnergy; //fallback value
    }
    return energy;
  },
  KeepNumBugsInRange(numBugs) {
    numBugs = Number(numBugs);
    return utils.Clamp(numBugs, 0, 2);
  },
  ApplyBug(gameState) {
    gameState.bugsFound = +1;
    return gameState;
  },
  ApplyRegisterReset(register, gameState) {
    gameState.registers[register] = 0;
    return gameState;
  },
  ApplyRegisterError(register, gameState) {
    gameState.errors[register] = true;
    return gameState;
  },
  ApplyOperationError(operation, gameState) {
    gameState.errors[operation] = true;
    return gameState;
  },
  MaxNumObjetives: 12,
  MaxUnresolvedValue: 6
};


const GameEventCard = {
  type: CardType.Event
};

const GameCards = {

  Objetive: { type: CardType.Objetive },
  Bug: {
    type: CardType.Bug,
    applyRules: Rules.ApplyBug
  },
  ResetA: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ResetA, applyRules: Rules.ApplyRegisterReset.bind(undefined, "A") }),
  ResetB: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ResetB, applyRules: Rules.ApplyRegisterReset.bind(undefined, "B") }),
  ResetC: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ResetC, applyRules: Rules.ApplyRegisterReset.bind(undefined, "C") }),
  ResetD: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ResetD, applyRules: Rules.ApplyRegisterReset.bind(undefined, "D") }),
  OK: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.Ok, applyRules: (gameState) => { return gameState; } }),
  ErrorB: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ErrorB, applyRules: Rules.ApplyRegisterError.bind(undefined, "B") }),
  ErrorC: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ErrorC, applyRules: Rules.ApplyRegisterError.bind(undefined, "C") }),
  ErrorD: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ErrorD, applyRules: Rules.ApplyRegisterError.bind(undefined, "D") }),
  ErrorROL: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ErrorROL, applyRules: Rules.ApplyOperationError.bind(undefined, "ROL") }),
  ErrorXOR: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ErrorXOR, applyRules: Rules.ApplyOperationError.bind(undefined, "XOR") }),
  ErrorNOT: Object.assign({}, { ...GameEventCard }, { eventType: GameEventType.ErrorNOT, applyRules: Rules.ApplyOperationError.bind(undefined, "NOT") })
};

module.exports.Rules = Rules;
module.exports.OperationCode = OperationCode;
module.exports.CardType = CardType;
module.exports.GameCards = GameCards;
module.exports.GameEventType = GameEventType;
