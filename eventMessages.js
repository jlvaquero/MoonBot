const EngineEvents = require('./engineEvents');
const { GameEventType } = require('./gameRules');

//pass status builder
const telegramEventMessages = {
  [EngineEvents.gameLost]: "You have been unable to complete the tasks.You crashed \u{1F4A5} \u{1F314} and died horrybly \u{1F480}.",
  [EngineEvents.gameWon]: "\u{1F389} Congratulations.\u{1F38A} All objetives completed. You landed successful on the surface of the moon.",
  [EngineEvents.gameCreated]: "Game created. You and other group members can /joingame.",
  [EngineEvents.gameNotCreated]: "Game still not created. /creategame if you want to play MOON (1110011)",
  [EngineEvents.gameStarted]: "Game has been started. \u{1F680} \u{1F314}",
  [EngineEvents.gameCancelled]: "Game has been cancelled.",
  [EngineEvents.gameNotStarted]: "%s. Game has not been started. /startgame to start the first round.",
  [EngineEvents.gameAlreadyStarted]: "%s. You can not do that when a game has been started.",
  [EngineEvents.gameAlreadyCreated]: "%s. A Game is already created.",

  [EngineEvents.gameNumBitsMissed]: "How many bits should have the computer's registers?",
  [EngineEvents.gameNumBugsMissed]: "How many bugs should have the computer's code?",
  [EngineEvents.gameMaxEnergyMissed]: "How many enrgy points should the players have?",
  [EngineEvents.gameUseEventsMissed]: "Should game events be used?",

  [EngineEvents.playerAlreadyJoined]: "%s. You are already joined.",
  [EngineEvents.playerJoined]: "\u{1F468}\u{200D}\u{1F680} %s has joined the game.",
  [EngineEvents.playerNotJoined]: "%s. You are not joined into the game. /joingame if you want to play.",
  [EngineEvents.playerLeft]: "\u{1F468}\u{200D}\u{1F680} %s has left the game.",
  [EngineEvents.noPlayersLeft]: "Last player left the game.",
  [EngineEvents.notPlayerTurn]: "It is not your turn %s.",

  [EngineEvents.turnEnded]: "\u{1F468}\u{200D}\u{1F680} %s ends turn.",
  [EngineEvents.roundFinished]: "New round has been started. Objetive slot increased.",
  [EngineEvents.notEnoughEnergy]: "%s. You have not enough \u{1F50B} for that operation.",
  [EngineEvents.operationApplied]: "Register operation applied.",
  [EngineEvents.objetiveAccomplished]: "\u{2705} Great %s! You have accomplished one objetive!",
  [EngineEvents.bugFound]: "Ops! You have found a bug in the program \u{1F41E}. Maximun objetive slots decreased.",

 // [EngineEvents.gameEventFound]: "Something has changed the computer state.",
  [GameEventType.ErrorB]: "System malfunction! Register B has been disabled \u{274C} for Read/Write.",
  [GameEventType.ErrorC]: "System malfunction! Register C has been disabled \u{274C} for Read/Write.",
  [GameEventType.ErrorD]: "System malfunction! Register D has been disabled \u{274C} for Read/Write.",
  [GameEventType.ResetA]: "System malfunction! Register A has been reset \u{1F17E}",
  [GameEventType.ResetB]: "System malfunction! Register B has been reset \u{1F17E}",
  [GameEventType.ResetC]: "System malfunction! Register C has been reset \u{1F17E}",
  [GameEventType.ResetD]: "System malfunction! Register D has been reset \u{1F17E}",
  [EngineEvents.registerLocked]: "Target register is disabled. Operation aborted."

};


/*define other custom messages for other platforms if needed
i.e.:

const slackEventMessages = {
  [GameEvents.gameLost]: "yada yada yada"
}*/

module.exports.telegramEventMessages = telegramEventMessages;
