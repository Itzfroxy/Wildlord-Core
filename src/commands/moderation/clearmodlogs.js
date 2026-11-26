
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getGuild, updateGuild } = require("../../utils/database");

module.exports = {
  name: "clearmodlogs",
  aliases: ["resetmodlogs", "clearmlogs"],

  data: new SlashCommandBuilder()
    .setName("clearmodlogs")
    .setDescription("Clear all moderation logs")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ केवल Administrator यह कर सकता है।");
    }

    const guildData = getGuild(message.guild.id);
    const count = (guildData.modLogs || []).length;

    updateGuild(message.guild.id, { modLogs: [] });

    return message.reply(
      `✅ कुल **${count}** Moderation Logs साफ कर दिए गए।`
    );
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ केवल Administrator यह कर सकता है।",
        ephemeral: true
      });
    }

    const guildData = getGuild(interaction.guild.id);
    const count = (guildData.modLogs || []).length;

    updateGuild(interaction.guild.id, { modLogs: [] });

    return interaction.reply({
      content: `✅ कुल **${count}** Moderation Logs साफ कर दिए गए।`,
      ephemeral: true
    });
  }
};
