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

const playerAlreadyJoined = Symbol.for("PLAYER_ALREADY_JOINED");
const playerJoined = Symbol.for("PLAYER_JOINED");
const playerNotJoined = Symbol.for("PLAYER_NOT_JOINED");
const playerLeft = Symbol.for("PLAYER_LEFT");
const noPlayersLeft = Symbol.for("NO_PLAYERS_LEFT");
const notPlayerTurn = Symbol.for("NOT_PLAYER_TURN");

const turnEnded = Symbol.for("TURN_ENDED");
const notEnoughEnergy = Symbol.for("NOT_ENOUGH_ENERGY");
const operationApplied = Symbol.for("OPERATION_APPLIED");
const objetiveAccomplished = Symbol.for("OBJETIVE_ACCOMPLISHED");

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

module.exports.playerAlreadyJoined = playerAlreadyJoined;
module.exports.playerJoined = playerJoined;
module.exports.playerNotJoined = playerNotJoined;
module.exports.playerLeft = playerLeft;
module.exports.noPlayersLeft = noPlayersLeft;
module.exports.notPlayerTurn = notPlayerTurn;

module.exports.turnEnded = turnEnded;
module.exports.notEnoughEnergy = notEnoughEnergy;
module.exports.operationApplied = operationApplied;
module.exports.objetiveAccomplished = objetiveAccomplished;