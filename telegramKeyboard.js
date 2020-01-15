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
        [{ text: "Yes", callback_data: `${numBits} ${numBugs} ${maxEnergy} 1` }, { text: "No", callback_data: `${numBits} ${numBugs} ${maxEnergy} 0` }]
      ]
    };
  }
};

module.exports = telegramKeyboards;
