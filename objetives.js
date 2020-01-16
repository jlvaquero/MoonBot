const utils = require('./utils');
const { Rules, CardType, GameCards } = require('./gameRules');

function ObjetivesGenerator(numBits, numBugs, useEvents) {

  const maxValue = Math.pow(2, numBits) - 1;

  let potentialObjetives = utils.Range(1, maxValue); //generate integer array
  potentialObjetives = utils.Shuffle(potentialObjetives); //randomize order
  const registerValues = potentialObjetives.splice(0, 3); //get first 3 objetives for initial register values
  potentialObjetives = potentialObjetives.slice(0, Rules.MaxNumObjetives);//get max num of objetives
  potentialObjetives = potentialObjetives.map((value) => Object.assign({}, { ...GameCards.Objetive }, { value: value })); //transform into objetive cards
  potentialObjetives = potentialObjetives.concat(Array(numBugs).fill(GameCards.Bug)); //add bugs cards to the end
  potentialObjetives = utils.Shuffle(potentialObjetives); //randomize order

  return { registerValues: registerValues, objetives: potentialObjetives };

}

module.exports = ObjetivesGenerator;