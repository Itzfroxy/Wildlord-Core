
const { EmbedBuilder } = require("discord.js");
const { getGuild, updateGuild } = require("./database");

async function sendModLog(guild, {
  action,
  targetId,
  moderatorId,
  reason = "No reason provided",
  details = null
}) {
  try {
    const guildData = getGuild(guild.id);
    const channelId = guildData.modLogChannelId;

    const logEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      targetId,
      moderatorId,
      reason,
      details,
      date: new Date().toISOString()
    };

    const modLogs = Array.isArray(guildData.modLogs)
      ? guildData.modLogs
      : [];

    modLogs.push(logEntry);

    updateGuild(guild.id, {
      ...guildData,
      modLogs: modLogs.slice(-500)
    });

    if (!channelId) return false;

    const channel = await guild.channels.fetch(channelId).catch(() => null);

    if (!channel || !channel.isTextBased() || !channel.isSendable()) {
      return false;
    }

    const embed = new EmbedBuilder()
      .setColor("#E67E22")
      .setTitle(`🛡️ Moderation: ${action}`)
      .addFields(
        { name: "Target", value: `<@${targetId}> (\`${targetId}\`)` },
        { name: "Moderator", value: `<@${moderatorId}>` },
        { name: "Reason", value: String(reason).slice(0, 1024) }
      )
      .setTimestamp(new Date(logEntry.date));

    if (details) {
      embed.addFields({
        name: "Details",
        value: String(details).slice(0, 1024)
      });
    }

    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error("Mod Logger Error:", error);
    return false;
  }
}

module.exports = { sendModLog };
