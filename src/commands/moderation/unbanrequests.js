
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

function createRequestsEmbed(guildId) {
  const guildData = getGuild(guildId);
  const requests = (guildData.unbanRequests || [])
    .filter(request => request.status === "pending")
    .slice(-10)
    .reverse();

  const embed = new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("📨 Pending Unban Requests")
    .setDescription(
      `Pending Requests: **${requests.length}**`
    )
    .setTimestamp();

  if (requests.length === 0) {
    embed.setDescription("अभी कोई Pending Unban Request नहीं है।");
    return embed;
  }

  requests.forEach((request, index) => {
    embed.addFields({
      name: `Request ${index + 1}`,
      value:
        `**User:** ${request.username}\n` +
        `**User ID:** \`${request.userId}\`\n` +
        `**Reason:** ${request.reason}\n` +
        `**Date:** <t:${Math.floor(new Date(request.date).getTime() / 1000)}:R>`
    });
  });

  return embed;
}

module.exports = {
  name: "unbanrequests",
  aliases: ["ubrequests", "pendingunbans"],

  data: new SlashCommandBuilder()
    .setName("unbanrequests")
    .setDescription("View pending unban requests")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ तुम्हारे पास Ban Members Permission नहीं है।");
    }

    return message.reply({
      embeds: [createRequestsEmbed(message.guild.id)]
    });
  },

  async executeSlash(interaction) {
    return interaction.reply({
      embeds: [createRequestsEmbed(interaction.guild.id)],
      ephemeral: true
    });
  }
};
