const gameLost = Symbol.for("GAME_LOST");
const gameWon = Symbol.for("GAME_WON");
const gameCreated = Symbol.for("GAME_CREATED");
const gameNotCreated = Symbol.for("GAME_NOT_CREATED");
const gameStarted = Symbol.for("GAME_STARTED");
const gameCancelled = Symbol.for("GAME_CANCELLED");
const gameNotStarted = Symbol.for("GAME_NOT_STARTED");
const gameAlreadyStarted = Symbol.for("GAME_ALREADY_STARTED");
const gameAlreadyCreated = Symbol.for("GAME_ALREADY_CREATED");
const gameStatusConsulted = Symbol.for("GAME_STAUTS_CONSULTED");
const gameStatusChanged = Symbol.for("GAME_STAUTS_CHANGED");

const gameNumBitsMissed = Symbol.for("GAME_NUMBITS_MISSED");
const gameNumBugsMissed = Symbol.for("GAME_NUMBUGS_MISSED");
const gameMaxEnergyMissed = Symbol.for("GAME_MAXENERGY_MISSED");
const gameUseEventsMissed = Symbol.for("GAME_USEREVENTS_MISSED");

const playerAlreadyJoined = Symbol.for("PLAYER_ALREADY_JOINED");
const playerJoined = Symbol.for("PLAYER_JOINED");
const playerNotJoined = Symbol.for("PLAYER_NOT_JOINED");
const playerLeft = Symbol.for("PLAYER_LEFT");
const noPlayersLeft = Symbol.for("NO_PLAYERS_LEFT");
const notPlayerTurn = Symbol.for("NOT_PLAYER_TURN");

const turnEnded = Symbol.for("TURN_ENDED");
const roundFinished = Symbol.for("ROUND_FINISHED");
const notEnoughEnergy = Symbol.for("NOT_ENOUGH_ENERGY");
const operationApplied = Symbol.for("OPERATION_APPLIED");
const objetiveAccomplished = Symbol.for("OBJETIVE_ACCOMPLISHED");

const bugFound = Symbol.for("BUG_FOUND");
const gameEventFound = Symbol.for("GAME_EVENT_FOUND");
const registerLocked = Symbol.for("REGISTER_LOCKED");
const operationLocked = Symbol.for("OPERATION_LOCKED");
const fixOperationPending = Symbol.for("FIX_OPERATION_PENDING");
const fixOperationApplied = Symbol.for("FIX_OPERATION_APPLIED");
const noFixLeft = Symbol.for("NO_FIX_LEFT");
const alreadyFixed = Symbol.for("FIX_ALREADY_FIXED");

module.exports.gameLost = gameLost;
module.exports.gameWon = gameWon;
module.exports.gameCreated = gameCreated;
module.exports.gameNotCreated = gameNotCreated;
module.exports.gameStarted = gameStarted;
module.exports.gameCancelled = gameCancelled;
module.exports.gameNotStarted = gameNotStarted;
module.exports.gameAlreadyStarted = gameAlreadyStarted;
module.exports.gameAlreadyCreated = gameAlreadyCreated;
module.exports.gameStatusConsulted = gameStatusConsulted;
module.exports.gameStatusChanged = gameStatusChanged;

module.exports.gameNumBitsMissed = gameNumBitsMissed;
module.exports.gameNumBugsMissed = gameNumBugsMissed;
module.exports.gameMaxEnergyMissed = gameMaxEnergyMissed;
module.exports.gameUseEventsMissed = gameUseEventsMissed;

module.exports.playerAlreadyJoined = playerAlreadyJoined;
module.exports.playerJoined = playerJoined;
module.exports.playerNotJoined = playerNotJoined;
module.exports.playerLeft = playerLeft;
module.exports.noPlayersLeft = noPlayersLeft;
module.exports.notPlayerTurn = notPlayerTurn;

module.exports.turnEnded = turnEnded;
module.exports.roundFinished = roundFinished;
module.exports.notEnoughEnergy = notEnoughEnergy;
module.exports.operationApplied = operationApplied;
module.exports.objetiveAccomplished = objetiveAccomplished;

module.exports.bugFound = bugFound;
module.exports.gameEventFound = gameEventFound;
module.exports.registerLocked = registerLocked;
module.exports.operationLocked = operationLocked;
module.exports.fixOperationPending = fixOperationPending;
module.exports.fixOperationApplied = fixOperationApplied;
module.exports.noFixLeft = noFixLeft;
module.exports.alreadyFixed = alreadyFixed;