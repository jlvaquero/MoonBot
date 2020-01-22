function Operations(numBits) {

  const valueRange = Math.pow(2, numBits);
  const maxValue = valueRange - 1;
  const halfValue = valueRange / 2;

  return {

    INC(value) {
      if (value === maxValue) return 0;
      return ++value;
    },
    DEC(value) {
      if (value === 0) return maxValue;
      return --value;
    },
    MOV(_, value2) {
      return value2;
    },
    NOT(value) {
      return maxValue - value;
    },
    OR(value1, value2) {
      return value1 | value2;
    },
    AND(value1, value2) {
      return value1 & value2;
    },
    XOR(value1, value2) {
      return value1 ^ value2;
    },
    ROR(value) {
      if (value === 0 || value === maxValue) return value;
      const newValue = (value >> 1);
      if ((value & 0x1) === 0x1) return (newValue | halfValue);
      return newValue;
    },
    ROL(value) {
      if (value === 0 || value === maxValue) return value;
      const newValue = (value << 1);
      if (value < halfValue) return newValue;
      return ((newValue & maxValue) | 0x1);
    }
  };
}

module.exports = Operations;