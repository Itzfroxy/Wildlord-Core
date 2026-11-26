const { getUser, updateUser } = require("../utils/database");

const voiceSessions = new Map();

module.exports = {
  name: "voiceStateUpdate",

  async execute(oldState, newState) {
    const member = newState.member || oldState.member;

    if (!member || member.user.bot) return;

    const guildId = newState.guild.id;
    const userId = member.id;
    const sessionKey = `${guildId}_${userId}`;

    // अगर यूजर पुराने Voice Channel से निकला
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      const session = voiceSessions.get(sessionKey);

      if (session) {
        const seconds = Math.floor(
          (Date.now() - session.joinedAt) / 1000
        );

        const user = getUser(guildId, userId);

        updateUser(guildId, userId, {
          voiceSeconds: (user.voiceSeconds || 0) + seconds
        });

        voiceSessions.delete(sessionKey);
      }
    }

    // अगर यूजर नए Voice Channel में आया
    if (newState.channelId && oldState.channelId !== newState.channelId) {
      voiceSessions.set(sessionKey, {
        joinedAt: Date.now()
      });
    }
  }
};
