const settings = require("../config/settings");

function getRequiredXP(level) {
  return level * settings.leveling.xpPerLevel;
}

function calculateLevel(totalXP) {
  let level = 0;
  let remainingXP = totalXP;

  while (remainingXP >= getRequiredXP(level + 1)) {
    remainingXP -= getRequiredXP(level + 1);
    level++;
  }

  return {
    level,
    currentXP: remainingXP,
    requiredXP: getRequiredXP(level + 1)
  };
}

function addXP(currentXP, amount) {
  const totalXP = currentXP + amount;

  return {
    totalXP,
    ...calculateLevel(totalXP)
  };
}

module.exports = {
  getRequiredXP,
  calculateLevel,
  addXP
};
