const utils = require('./utils');
const { Rules } = require('./gameRules');

function ObjetivesGenerator(numBits) {

  const maxValue = Math.pow(2, numBits) - 1;
  let potentialObjetives = utils.Shuffle(utils.Range(1, maxValue));
  const registerValues = potentialObjetives.splice(0, 3);
  potentialObjetives = potentialObjetives.slice(0, Rules.MaxNumObjetives);

  return { registerValues: registerValues, objetives: potentialObjetives };

}

module.exports = ObjetivesGenerator;