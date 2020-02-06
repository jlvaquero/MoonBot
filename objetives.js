const utils = require('./utils');
const { Rules, GameCards } = require('./gameRules');

function ObjetivesGenerator(numBits, numBugs, useEvents) {

  const maxValue = Math.pow(2, numBits) - 1;

  let potentialObjetives = utils.Range(1, maxValue); //generate integer array
  potentialObjetives = utils.Shuffle(potentialObjetives); //randomize order
  const registerValues = potentialObjetives.splice(0, 3); //get first 3 objetives for initial register values
  potentialObjetives = potentialObjetives.slice(0, Rules.MaxNumObjetives);//get max num of objetives
  potentialObjetives = potentialObjetives.map((value) => ({ ...GameCards.Objetive, value: value })); //transform into objetive cards
  const current = potentialObjetives.pop(); //ensure first objetive before adding bugs and events
  potentialObjetives = potentialObjetives.concat(Array(numBugs).fill(GameCards.Bug)); //add bugs cards to the end

  if (useEvents === "1") { //add events cards
    const events = [GameCards.ResetA, GameCards.ResetB, GameCards.ResetC, GameCards.ResetD, GameCards.ErrorB, GameCards.ErrorC, GameCards.ErrorD, GameCards.ErrorNOT, GameCards.ErrorROL, GameCards.ErrorXOR].concat(Array(4).fill(GameCards.OK));
    potentialObjetives = potentialObjetives.concat(events);
  }

  potentialObjetives = utils.Shuffle(potentialObjetives); //randomize order

  return { registerValues: registerValues, objetives: potentialObjetives, currentObjetive: current };
  
/*const objetives = [{ ...GameCards.Objetive, value: 5 }, GameCards.OK , GameCards.ResetA, GameCards.ResetB, GameCards.ResetC, GameCards.ResetD, GameCards.ErrorB, GameCards.ErrorC, GameCards.ErrorD, GameCards.ErrorNOT, GameCards.ErrorROL, GameCards.ErrorXOR];
  return { registerValues: [1, 2, 3], objetives: objetives, currentObjetive: { ...GameCards.Objetive, value: 4 } };*/
}

module.exports = ObjetivesGenerator;