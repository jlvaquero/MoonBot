const gameLost = Symbol.for("GAME_LOST");
const gameWon = Symbol.for("GAME_WON");
const gameCreated = Symbol.for("GAME_CREATED");
const gameNotCreated = Symbol.for("GAME_NOT_CREATED");
const gameStarted = Symbol.for("GAME_STARTED");
const gameCancelled = Symbol.for("GAME_CANCELLED");
const gameNotStarted = Symbol.for("GAME_NOT_STARTED");
const gameAlreadyStarted = Symbol.for("GAME_ALREADY_STARTED");
const gameAlreadyCreated = Symbol.for("GAME_ALREADY_CREATED");

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

const eventMessages = {
  [gameLost]: "You have been unable to complete the tasks.You crashed \u{1F4A5} \u{1F314} and died horrybly \u{1F480}.",
  [gameWon]: "\u{1F389} Congratulations.\u{1F38A} All objetives completed. You landed successful on the surface of the moon.",
  [gameCreated]: "Game created. Now, other group members can /joingame.",
  [gameNotCreated]: "Game still not created. /creategame if you want to play MOON (1110011)",
  [gameStarted]: "Game has been started. \u{1F680} \u{1F314}",
  [gameCancelled]: "Game has been cancelled.",
  [gameNotStarted]: "%s. Game has not been started. /startgame to start the first round.",
  [gameAlreadyStarted]: "%s. You can not do that when a game has been started.",
  [gameAlreadyCreated]: "%s. A Game is already created.",

  [playerAlreadyJoined]: "%s. You are already joined.",
  [playerJoined]: "\u{1F468}\u{200D}\u{1F680} %s has joined the game.",
  [playerNotJoined]: "%s. You are not joined into the game. /joingame if you want to play.",
  [playerLeft]: "\u{1F468}\u{200D}\u{1F680} %s has left the game.",
  [noPlayersLeft]: "Last player left the game.",
  [notPlayerTurn]: "It is not your turn %s.",

  [turnEnded]: "\u{1F468}\u{200D}\u{1F680} %s ends turn.",
  [notEnoughEnergy]: "%s. You have not enough \u{1F50B} for that operation.",
  [operationApplied]: "Register operation applied.",
  [objetiveAccomplished]: "\u{2705} Great %s! You have accomplished one objetive!"
};

module.exports.gameLost = gameLost;
module.exports.gameWon = gameWon;
module.exports.gameCreated = gameCreated;
module.exports.gameNotCreated = gameNotCreated;
module.exports.gameStarted = gameStarted;
module.exports.gameCancelled = gameCancelled;
module.exports.gameNotStarted = gameNotStarted;
module.exports.gameAlreadyStarted = gameAlreadyStarted;
module.exports.gameAlreadyCreated = gameAlreadyCreated;

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

module.exports.eventMessages = eventMessages;

