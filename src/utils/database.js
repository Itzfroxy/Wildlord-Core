const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(process.cwd(), "data");
const databaseFile = path.join(dataDirectory, "database.json");

function ensureDatabase() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(
      databaseFile,
      JSON.stringify({ users: {}, guilds: {} }, null, 2)
    );
  }
}

function readDatabase() {
  ensureDatabase();

  try {
    return JSON.parse(fs.readFileSync(databaseFile, "utf8"));
  } catch (error) {
    console.error("Database read error:", error);
    return { users: {}, guilds: {} };
  }
}

function saveDatabase(data) {
  ensureDatabase();

  fs.writeFileSync(
    databaseFile,
    JSON.stringify(data, null, 2)
  );
}

function getUser(guildId, userId) {
  const db = readDatabase();
  const key = `${guildId}_${userId}`;

  return db.users[key] || {
    guildId,
    userId,
    xp: 0,
    level: 0,
    messages: 0,
    voiceSeconds: 0,
    lastMessage: 0
  };
}

function updateUser(guildId, userId, updates) {
  const db = readDatabase();
  const key = `${guildId}_${userId}`;

  db.users[key] = {
    ...getUser(guildId, userId),
    ...updates
  };

  saveDatabase(db);
  return db.users[key];
}

function getGuild(guildId) {
  const db = readDatabase();

  return db.guilds[guildId] || {
    guildId,
    settings: {}
  };
}

function updateGuild(guildId, updates) {
  const db = readDatabase();

  db.guilds[guildId] = {
    ...getGuild(guildId),
    ...updates
  };

  saveDatabase(db);
  return db.guilds[guildId];
}

module.exports = {
  readDatabase,
  saveDatabase,
  getUser,
  updateUser,
  getGuild,
  updateGuild
};
