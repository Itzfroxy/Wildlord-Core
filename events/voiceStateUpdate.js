
const { getUser, updateUser } = require("../utils/database");

const voiceSessions = new Map();

module.exports = function (client) {
  client.on("voiceStateUpdate", (oldState, newState) => {
    const member = newState.member || oldState.member;

    if (!member || member.user.bot || !member.guild) return;

    const key = `${member.guild.id}-${member.id}`;

    // Joined a voice channel
    if (!oldState.channelId && newState.channelId) {
      voiceSessions.set(key, Date.now());
      return;
    }

    // Left a voice channel
    if (oldState.channelId && !newState.channelId) {
      const started = voiceSessions.get(key);

      if (started) {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        const data = getUser(member.guild.id, member.id);

        updateUser(member.guild.id, member.id, {
          xp: data.xp,
          level: data.level,
          messages: data.messages,
          voiceTime: data.voiceTime + elapsed
        });

        voiceSessions.delete(key);
      }
      return;
    }

    // Switched voice channels
    if (oldState.channelId && newState.channelId &&
        oldState.channelId !== newState.channelId) {
      return;
    }
  });
};
