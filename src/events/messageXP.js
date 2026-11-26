const { getUser, updateUser } = require("../utils/database");
const settings = require("../config/settings");
const { calculateLevel } = require("../utils/leveling");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    if (!message.guild || message.author.bot) return;
    if (!settings.leveling.enabled) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    const user = getUser(guildId, userId);

    const now = Date.now();
    const cooldown = settings.leveling.cooldownSeconds * 1000;

    let xp = user.xp || 0;
    let lastMessage = user.lastMessage || 0;

    const updates = {
      messages: (user.messages || 0) + 1
    };

    if (now - lastMessage >= cooldown) {
      const min = settings.leveling.xpPerMessageMin;
      const max = settings.leveling.xpPerMessageMax;

      const earnedXP = Math.floor(
        Math.random() * (max - min + 1) + min
      );

      xp += earnedXP;

      const levelData = calculateLevel(xp);

      updates.xp = xp;
      updates.level = levelData.level;
      updates.lastMessage = now;

      if (levelData.level > (user.level || 0)) {
        await message.channel.send(
          `🎉 Congratulations ${message.author}! You reached **Level ${levelData.level}**!`
        ).catch(() => {});
      }
    }

    updateUser(guildId, userId, updates);
  }
};
