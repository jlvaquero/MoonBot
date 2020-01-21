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

  [EngineEvents.gameNumBitsMissed]: "How many bits should have the processor registers?",
  [EngineEvents.gameNumBugsMissed]: "How many bugs should have the software?",
  [EngineEvents.gameMaxEnergyMissed]: "How many energy points should the players have?",
  [EngineEvents.gameUseEventsMissed]: "Should game events be used?",

  [EngineEvents.playerAlreadyJoined]: "%s. You are already joined.",
  [EngineEvents.playerJoined]: "\u{1F468}\u{200D}\u{1F680} %s has joined the game.",
  [EngineEvents.playerNotJoined]: "%s. You are not joined into the game. /joingame if you want to play.",
  [EngineEvents.playerLeft]: "\u{1F468}\u{200D}\u{1F680} %s has left the game.",
  [EngineEvents.noPlayersLeft]: "Last player left the game.",
  [EngineEvents.notPlayerTurn]: "It is not your turn %s.",

  [EngineEvents.turnEnded]: "\u{1F468}\u{200D}\u{1F680} %s ends turn.",
  [EngineEvents.roundFinished]: "New round \u{1F504} has been started. Objetive slot increased.",
  [EngineEvents.notEnoughEnergy]: "%s. You have not enough \u{1F50B} for that operation.",
  [EngineEvents.operationApplied]: "\u{1F197} Register operation applied.",
  [EngineEvents.objetiveAccomplished]: "\u{2705} Great %s! You have accomplished one objetive!",
  [EngineEvents.bugFound]: "\u{26A0} Bug \u{1F41E} found in the code. Maximun objetive slots decreased.",

 // [EngineEvents.gameEventFound]: "Something has changed the computer state.",
  [GameEventType.ErrorB]: "\u{26A0} System malfunction! Register B has been disabled \u{274C} for Read/Write.",
  [GameEventType.ErrorC]: "\u{26A0} System malfunction! Register C has been disabled \u{274C} for Read/Write.",
  [GameEventType.ErrorD]: "\u{26A0} System malfunction! Register D has been disabled \u{274C} for Read/Write.",
  [GameEventType.ResetA]: "\u{26A0} System malfunction! Register A has been reset \u{1F17E}",
  [GameEventType.ResetB]: "\u{26A0} System malfunction! Register B has been reset \u{1F17E}",
  [GameEventType.ResetC]: "\u{26A0} System malfunction! Register C has been reset \u{1F17E}",
  [GameEventType.ResetD]: "\u{26A0} System malfunction! Register D has been reset \u{1F17E}",
  [GameEventType.ErrorNOT]: "\u{26A0} System malfunction! NOT operation has been disabled. \u{274C}",
  [GameEventType.ErrorROL]: "\u{26A0} System malfunction! ROL operation has been disabled. \u{274C}",
  [GameEventType.ErrorXOR]: "\u{26A0} System malfunction! XOR operation has been disabled. \u{274C}",

  [EngineEvents.registerLocked]: "\u{26D4} Target register is disabled. Operation aborted.",
  [EngineEvents.operationLocked]: "\u{26D4} Requested operation is disabled. Operation aborted."

};


/*define other custom messages for other platforms if needed
i.e.:

const slackEventMessages = {
  [GameEvents.gameLost]: "yada yada yada"
}*/

module.exports.telegramEventMessages = telegramEventMessages;
