function Operations(numBits) {

  const valueRange = Math.pow(2, numBits);
  const maxValue = valueRange - 1;
  const halfValue = valueRange / 2;

  return {

    inc(value) {
      if (value === maxValue) return 0;
      return ++value;
    },
    dec(value) {
      if (value === 0) return maxValue;
      return --value;
    },
    mov(_, value2 ) {
      return value2;
    },
    not(value) {
      return maxValue - value;
    },
    or(value1, value2) {
      return value1 | value2;
    },
    and(value1, value2) {
      return value1 & value2;
    },
    xor(value1, value2) {
      return value1 ^ value2;
    },
    ror(value) {
      if (value === 0 || value === maxValue) return value;
      const newValue = (value >> 1);
      if ((value & 0x1) === 0x1) return (newValue | halfValue);
      return newValue;
    },
    rol(value) {
      if (value === 0 || value === maxValue) return value;
      const newValue = (value << 1);
      if (value < halfValue) return newValue;
      return ((newValue & maxValue) | 0x1);
    }
  };
}

module.exports = Operations;