
const fs = require("fs");
const path = require("path");

const dataFolder = path.join(__dirname, "..", "data");
const dataFile = path.join(dataFolder, "users.json");

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({}, null, 2));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function getUser(guildId, userId) {
  const data = readData();
  const key = `${guildId}-${userId}`;

  if (!data[key]) {
    data[key] = {
      xp: 0,
      level: 0,
      messages: 0,
      voiceTime: 0
    };
    saveData(data);
  }

  return data[key];
}

function updateUser(guildId, userId, updates) {
  const data = readData();
  const key = `${guildId}-${userId}`;

  if (!data[key]) {
    data[key] = {
      xp: 0,
      level: 0,
      messages: 0,
      voiceTime: 0
    };
  }

  Object.assign(data[key], updates);
  saveData(data);

  return data[key];
}

module.exports = {
  getUser,
  updateUser
};
