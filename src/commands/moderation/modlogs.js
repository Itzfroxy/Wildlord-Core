
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

function createLogsEmbed(guild) {
  const guildData = getGuild(guild.id);
  const logs = guildData.modLogs || [];

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("📋 Moderation Logs")
    .setDescription(
      logs.length
        ? `Total recorded actions: **${logs.length}**`
        : "अभी कोई Moderation Logs उपलब्ध नहीं हैं।"
    )
    .setTimestamp();

  logs.slice(-10).reverse().forEach((log, index) => {
    embed.addFields({
      name: `${index + 1}. ${log.action || "Unknown Action"}`,
      value:
        `**Target:** <@${log.targetId}>\n` +
        `**Moderator:** <@${log.moderatorId}>\n` +
        `**Reason:** ${log.reason || "No reason"}\n` +
        `**Date:** <t:${Math.floor(new Date(log.date).getTime() / 1000)}:R>`
    });
  });

  return embed;
}

module.exports = {
  name: "modlogs",
  aliases: ["moderationlogs", "mlogs"],

  data: new SlashCommandBuilder()
    .setName("modlogs")
    .setDescription("View recent moderation logs")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    return message.author.send({
      embeds: [createLogsEmbed(message.guild)]
    }).then(() => {
      message.reply("✅ Moderation Logs तुम्हारे DM में भेज दिए गए।");
    }).catch(() => {
      message.reply("❌ तुम्हारे DM बंद हैं।");
    });
  },

  async executeSlash(interaction) {
    return interaction.reply({
      embeds: [createLogsEmbed(interaction.guild)],
      ephemeral: true
    });
  }
};
