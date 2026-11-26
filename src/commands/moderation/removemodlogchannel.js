
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getGuild, updateGuild } = require("../../utils/database");

module.exports = {
  name: "removemodlogchannel",
  aliases: ["unsetmodlog", "disablemodlogs"],

  data: new SlashCommandBuilder()
    .setName("removemodlogchannel")
    .setDescription("Remove the moderation logs channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ तुम्हें Administrator Permission चाहिए।");
    }

    const guildData = getGuild(message.guild.id);

    if (!guildData.modLogChannelId) {
      return message.reply("❌ कोई Moderation Logs Channel सेट नहीं है।");
    }

    updateGuild(message.guild.id, {
      ...guildData,
      modLogChannelId: null
    });

    return message.reply("✅ Moderation Logs Channel हटा दिया गया।");
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ तुम्हें Administrator Permission चाहिए।",
        ephemeral: true
      });
    }

    const guildData = getGuild(interaction.guild.id);

    if (!guildData.modLogChannelId) {
      return interaction.reply({
        content: "❌ कोई Moderation Logs Channel सेट नहीं है।",
        ephemeral: true
      });
    }

    updateGuild(interaction.guild.id, {
      ...guildData,
      modLogChannelId: null
    });

    return interaction.reply({
      content: "✅ Moderation Logs Channel हटा दिया गया।",
      ephemeral: true
    });
  }
};
