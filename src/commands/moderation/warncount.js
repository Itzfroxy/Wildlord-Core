
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getUser } = require("../../utils/database");

function getWarningCount(guildId, target) {
  const userData = getUser(guildId, target.id);
  const warnings = userData.warnings || [];

  const embed = new EmbedBuilder()
    .setColor("#E67E22")
    .setTitle("⚠️ Warning Count")
    .setDescription(
      `**Member:** ${target.tag}\n` +
      `**Total Warnings:** ${warnings.length}`
    )
    .setTimestamp();

  if (warnings.length > 0) {
    embed.addFields({
      name: "Latest Warning",
      value: warnings[warnings.length - 1].reason || "No reason provided"
    });
  }

  return embed;
}

module.exports = {
  name: "warncount",
  aliases: ["warningcount", "totalwarns"],

  data: new SlashCommandBuilder()
    .setName("warncount")
    .setDescription("Check a member's total warnings")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to check")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const target = message.mentions.users.first() || message.author;

    return message.reply({
      embeds: [getWarningCount(message.guild.id, target)]
    });
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;

    return interaction.reply({
      embeds: [getWarningCount(interaction.guild.id, target)],
      ephemeral: true
    });
  }
};
