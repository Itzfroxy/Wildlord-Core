
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { readDatabase } = require("../../utils/database");

function getModStats(guildId, moderator) {
  const db = readDatabase();
  let warns = 0;

  for (const user of Object.values(db.users || {})) {
    if (user.guildId !== guildId) continue;

    warns += (user.warnings || []).filter(
      warning => warning.moderatorId === moderator.id
    ).length;
  }

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🛡️ Moderator Statistics")
    .setThumbnail(moderator.displayAvatarURL())
    .addFields(
      { name: "Moderator", value: `${moderator}`, inline: false },
      { name: "Warnings Given", value: `${warns}`, inline: true },
      { name: "Other Actions", value: "Not tracked yet", inline: true }
    )
    .setTimestamp();
}

module.exports = {
  name: "modstats",
  aliases: ["moderatorstats"],

  data: new SlashCommandBuilder()
    .setName("modstats")
    .setDescription("View a moderator's statistics")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Moderator to check")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const moderator = message.mentions.users.first() || message.author;

    return message.reply({
      embeds: [getModStats(message.guild.id, moderator)]
    });
  },

  async executeSlash(interaction) {
    const moderator = interaction.options.getUser("user") || interaction.user;

    return interaction.reply({
      embeds: [getModStats(interaction.guild.id, moderator)],
      ephemeral: true
    });
  }
};
