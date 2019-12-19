const utils = require('./utils');

function ObjetivesGenerator(numBits) {

  const maxValue = Math.pow(2, numBits) - 1;
  const Rnd1toMaxValue = () => utils.RandomInRange(1, maxValue);
  const GenerateRegisterValues = () => utils.GenerateRandomSet(Rnd1toMaxValue, 3);
  const registerValuesSet = GenerateRegisterValues();
  const GeneratePotentialObjetives = () => utils.Range(1, maxValue);
  const GetGameObjetives = () => utils.FilterArrWithSet(GeneratePotentialObjetives(), registerValuesSet);

  return { registerValuesSet: registerValuesSet, objetives: utils.Shuffle(GetGameObjetives()) };

}

module.exports = ObjetivesGenerator;