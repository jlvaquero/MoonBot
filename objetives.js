const utils = require('./utils');

function ObjetivesGenerator(numBits) {

  const maxValue = Math.pow(2, numBits) - 1;
  const potentialObjetives = utils.Shuffle(utils.Range(1, maxValue));
  const registerValues = potentialObjetives.splice(0, 3);

  return { registerValues: registerValues, objetives: potentialObjetives };

}

module.exports = ObjetivesGenerator;