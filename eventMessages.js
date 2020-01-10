const GameEvents = require('./gameEvents');

//pass status builder
const telegramEventMessages = {
  [GameEvents.gameLost]: "You have been unable to complete the tasks.You crashed \u{1F4A5} \u{1F314} and died horrybly \u{1F480}.",
  [GameEvents.gameWon]: "\u{1F389} Congratulations.\u{1F38A} All objetives completed. You landed successful on the surface of the moon.",
  [GameEvents.gameCreated]: "Game created. Now, other group members can /joingame.",
  [GameEvents.gameNotCreated]: "Game still not created. /creategame if you want to play MOON (1110011)",
  [GameEvents.gameStarted]: "Game has been started. \u{1F680} \u{1F314}",
  [GameEvents.gameCancelled]: "Game has been cancelled.",
  [GameEvents.gameNotStarted]: "%s. Game has not been started. /startgame to start the first round.",
  [GameEvents.gameAlreadyStarted]: "%s. You can not do that when a game has been started.",
  [GameEvents.gameAlreadyCreated]: "%s. A Game is already created.",
  [GameEvents.gameStatusConsulted] : null,
  [GameEvents.playerAlreadyJoined]: "%s. You are already joined.",
  [GameEvents.playerJoined]: "\u{1F468}\u{200D}\u{1F680} %s has joined the game.",
  [GameEvents.playerNotJoined]: "%s. You are not joined into the game. /joingame if you want to play.",
  [GameEvents.playerLeft]: "\u{1F468}\u{200D}\u{1F680} %s has left the game.",
  [GameEvents.noPlayersLeft]: "Last player left the game.",
  [GameEvents.notPlayerTurn]: "It is not your turn %s.",

  [GameEvents.turnEnded]: "\u{1F468}\u{200D}\u{1F680} %s ends turn.",
  [GameEvents.notEnoughEnergy]: "%s. You have not enough \u{1F50B} for that operation.",
  [GameEvents.operationApplied]: "Register operation applied.",
  [GameEvents.objetiveAccomplished]: "\u{2705} Great %s! You have accomplished one objetive!"
};

/*define other custom messages for other platforms if needed
i.e.:

const messengerEventMessages = {
  [GameEvents.gameLost]: "yada yada yada"
}*/

module.exports.telegramEventMessages = telegramEventMessages;
