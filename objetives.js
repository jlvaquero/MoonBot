const utils = require('./utils');
const { Rules, CardType, GameCards } = require('./gameRules');

function ObjetivesGenerator(numBits, numBugs, useEvents) {

  const maxValue = Math.pow(2, numBits) - 1;

  let potentialObjetives = utils.Range(1, maxValue); //generate integer array
  potentialObjetives = utils.Shuffle(potentialObjetives); //randomize order
  const registerValues = potentialObjetives.splice(0, 3); //get first 3 objetives for initial register values
  potentialObjetives = potentialObjetives.slice(0, Rules.MaxNumObjetives);//get max num of objetives
  potentialObjetives = potentialObjetives.map((value) => Object.assign({}, { ...GameCards.Objetive }, { value: value })); //transform into objetive cards
  const current = potentialObjetives.pop(); //ensure first objetive before add bugs and events
  potentialObjetives = potentialObjetives.concat(Array(numBugs).fill(GameCards.Bug)); //add bugs cards to the end

  if (useEvents === "1") { //add events cards
    const events = [GameCards.ResetA, GameCards.ResetB, GameCards.ResetD, GameCards.ErrorB, GameCards.ErrorC, GameCards.ErrorD];
    potentialObjetives = potentialObjetives.concat(events);
  }

  potentialObjetives = utils.Shuffle(potentialObjetives); //randomize order

  return { registerValues: registerValues, objetives: potentialObjetives, currentObjetive: current };

}

module.exports = ObjetivesGenerator;