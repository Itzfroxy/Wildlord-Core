
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

module.exports = {
  name: "modloginfo",
  aliases: ["modlogstatus", "checkmodlog"],

  data: new SlashCommandBuilder()
    .setName("modloginfo")
    .setDescription("Show the moderation logs channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ तुम्हें Administrator Permission चाहिए।");
    }

    const guildData = getGuild(message.guild.id);
    const channelId = guildData.modLogChannelId;

    if (!channelId) {
      return message.reply("❌ अभी कोई Moderation Logs Channel सेट नहीं है।");
    }

    const channel = message.guild.channels.cache.get(channelId);

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("📋 Moderation Log Settings")
      .setDescription(
        channel
          ? `**Current Channel:** ${channel}\n**Channel ID:** \`${channel.id}\``
          : `⚠️ Saved channel नहीं मिला। ID: \`${channelId}\``
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ तुम्हें Administrator Permission चाहिए।",
        ephemeral: true
      });
    }

    const guildData = getGuild(interaction.guild.id);
    const channelId = guildData.modLogChannelId;

    if (!channelId) {
      return interaction.reply({
        content: "❌ अभी कोई Moderation Logs Channel सेट नहीं है।",
        ephemeral: true
      });
    }

    const channel = interaction.guild.channels.cache.get(channelId);

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle("📋 Moderation Log Settings")
      .setDescription(
        channel
          ? `**Current Channel:** ${channel}\n**Channel ID:** \`${channel.id}\``
          : `⚠️ Saved channel नहीं मिला। ID: \`${channelId}\``
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
