const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getUser } = require("../../utils/database");

function getWarnings(guildId, userId) {
  const userData = getUser(guildId, userId);
  return userData.warnings || [];
}

function createWarningsEmbed(user, warnings) {
  const embed = new EmbedBuilder()
    .setColor("#E67E22")
    .setTitle(`⚠️ Warnings: ${user.tag}`)
    .setDescription(
      warnings.length
        ? `Total Warnings: **${warnings.length}**`
        : "इस Member की कोई Warning नहीं है।"
    )
    .setTimestamp();

  warnings.slice(-10).reverse().forEach((warning, index) => {
    embed.addFields({
      name: `Warning ${warnings.length - index}`,
      value:
        `**Reason:** ${warning.reason}\n` +
        `**Moderator:** <@${warning.moderatorId}>\n` +
        `**Date:** <t:${Math.floor(new Date(warning.date).getTime() / 1000)}:R>`
    });
  });

  return embed;
}

module.exports = {
  name: "warnings",
  aliases: ["warns"],

  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View a member's warnings")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to check")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const user = message.mentions.users.first() || message.author;
    const warnings = getWarnings(message.guild.id, user.id);

    return message.reply({
      embeds: [createWarningsEmbed(user, warnings)]
    });
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Moderate Members Permission नहीं है।",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user") || interaction.user;
    const warnings = getWarnings(interaction.guild.id, user.id);

    return interaction.reply({
      embeds: [createWarningsEmbed(user, warnings)]
    });
  }
};
