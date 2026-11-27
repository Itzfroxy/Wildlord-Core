
const { getGuild, updateGuild } = require("../utils/database");

module.exports = function startTempBanHandler(client) {
  async function checkTempBans() {
    for (const [guildId, guildData] of Object.entries(
      require("../utils/database").readDatabase().guilds || {}
    )) {
      const tempBans = guildData.tempBans || [];
      const remaining = [];

      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        remaining.push(...tempBans);
        continue;
      }

      for (const ban of tempBans) {
        if (ban.expiresAt > Date.now()) {
          remaining.push(ban);
          continue;
        }

        try {
          await guild.members.unban(
            ban.userId,
            "Temporary ban expired"
          );
        } catch (error) {
          console.error(
            `Tempban expiry failed for ${ban.userId}:`,
            error.message
          );

          remaining.push(ban);
        }
      }

      if (remaining.length !== tempBans.length) {
        updateGuild(guildId, { tempBans: remaining });
      }
    }
  }

  checkTempBans().catch(console.error);

  return setInterval(() => {
    checkTempBans().catch(console.error);
  }, 30000);
};
