function RandomInRange(minValue, maxValue) {
  return Math.round(Math.random() * (maxValue - minValue)) + minValue;
}

function Shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function GenerateRandomSet(randomGenerator, size) {
  let resultSet = new Set();
  while (resultSet.size < size) {
    resultSet.add(randomGenerator());
  }
  return resultSet;
}

function Range(start, count) {
  return [...Array(count).keys()].map((elmnt) => elmnt + start);
}

function FilterArrWithSet(arr, set) {
  return arr.filter(value => !set.has(value));
}

function Clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function pipe(until, fallback, ...fns) {

  return (input) => {

    for (fnc of fns) {
      temp = fnc(input);
      if (until(temp)) return fallback(temp);
      input = Object.assign(input, temp); 
    }
    return input;
  };
}

module.exports.RandomInRange = RandomInRange;
module.exports.Shuffle = Shuffle;
module.exports.GenerateRandomSet = GenerateRandomSet;
module.exports.Range = Range;
module.exports.FilterArrWithSet = FilterArrWithSet;
module.exports.Clamp = Clamp;
module.exports.pipe = pipe;

