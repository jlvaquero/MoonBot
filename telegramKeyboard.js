const telegramKeyboards = {
  numBitsKeyboard() {
    return {
      inline_keyboard: [
        [{ text: "4", callback_data: "4" }, { text: "5", callback_data: "5" }, { text: "6", callback_data: "6" }]
      ]
    };
  },

  numBugsKeyboard(numBits) {
    return {
      inline_keyboard: [
        [{ text: "0", callback_data: `${numBits} 0` }, { text: "1", callback_data: `${numBits} 1` }, { text: "2", callback_data: `${numBits} 2` }]
      ]
    };
  },

  maxEnergyKeyboard(numBits, numBugs) {
    return {
      inline_keyboard: [
        [{ text: "3", callback_data: `${numBits} ${numBugs} 3` }, { text: "2.5", callback_data: `${numBits} ${numBugs} 2.5` }, { text: "2", callback_data: `${numBits} ${numBugs} 2` }, { text: "1.5", callback_data: `${numBits} ${numBugs} 1.5` }]
      ]
    };
  },

  useEventsKeyboard(numBits, numBugs, maxEnergy) {
    return {
      inline_keyboard: [
        [{ text: "No", callback_data: `${numBits} ${numBugs} ${maxEnergy} 0` }, { text: "Yes", callback_data: `${numBits} ${numBugs} ${maxEnergy} 1` }]
      ]
    };
  },

  fixKeyBoard(errors) {

    const regArray = new Array();
    errors.B ? regArray.push({ text: "Fix B", callback_data: `fix B` }) : null;
    errors.C ? regArray.push({ text: "Fix C", callback_data: `fix C` }) : null;
    errors.D ? regArray.push({ text: "Fix D", callback_data: `fix D` }) : null;
    const opArray = new Array();
    errors.ROL ? opArray.push({ text: "Fix ROL", callback_data: `fix ROL` }) : null;
    errors.NOT ? opArray.push({ text: "Fix NOT", callback_data: `fix NOT` }) : null;
    errors.XOR ? opArray.push({ text: "Fix XOR", callback_data: `fix XOR` }) : null;

    return {
      inline_keyboard: [
        regArray,
        opArray
      ]
    };
  }
};

module.exports = telegramKeyboards;
