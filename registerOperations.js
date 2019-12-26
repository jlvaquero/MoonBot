function Operations(numBits) {

  const valueRange = Math.pow(2, numBits);
  const maxValue = valueRange - 1;
  const halfValue = valueRange / 2;

  return {

    inc: function (value) {
      if (value === maxValue) return 0;
      return ++value;
    },
    dec: function (value) {
      if (value === 0) return maxValue;
      return --value;
    },
    mov: function (_, value2 ) {
      return value2;
    },
    not: function (value) {
      return maxValue - value;
    },
    or: function (value1, value2) {
      return value1 | value2;
    },
    and: function (value1, value2) {
      return value1 & value2;
    },
    xor: function (value1, value2) {
      return value1 ^ value2;
    },
    ror: function (value) {
      if (value === 0 || value === maxValue) return value;
      let newValue = (value >> 1);
      if ((value & 0x1) === 0x1) return (newValue | halfValue);
      return newValue;
    },
    rol: function (value) {
      if (value === 0 || value === maxValue) return value;
      let newValue = (value << 1);
      if (value < halfValue) return newValue;
      return ((newValue - 0x10) | 0x1);
    }
  };
}

module.exports = Operations;