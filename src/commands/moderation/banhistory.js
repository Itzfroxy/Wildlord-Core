
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

function createBanHistory(guildId, userId) {
  const guildData = getGuild(guildId);

  const history = (guildData.modLogs || [])
    .filter(log =>
      log.targetId === userId &&
      log.action === "BAN"
    )
    .slice(-10)
    .reverse();

  const embed = new EmbedBuilder()
    .setColor("#E74C3C")
    .setTitle("🔨 Ban History")
    .setDescription(`User ID: \`${userId}\``)
    .setTimestamp();

  if (!history.length) {
    embed.setDescription("इस User का कोई Ban Record नहीं मिला।");
    return embed;
  }

  history.forEach((log, index) => {
    embed.addFields({
      name: `Ban ${index + 1}`,
      value:
        `**Moderator:** <@${log.moderatorId}>\n` +
        `**Reason:** ${log.reason || "No reason"}\n` +
        `**Date:** <t:${Math.floor(new Date(log.date).getTime() / 1000)}:R>`
    });
  });

  return embed;
}

module.exports = {
  name: "banhistory",
  aliases: ["bhistory", "banrecords"],

  data: new SlashCommandBuilder()
    .setName("banhistory")
    .setDescription("View a user's ban history")
    .addStringOption(option =>
      option.setName("userid")
        .setDescription("Discord User ID")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ तुम्हारे पास Ban Members Permission नहीं है।");
    }

    const userId = args[0]?.replace(/[<@!>]/g, "");

    if (!/^\d{17,20}$/.test(userId || "")) {
      return message.reply("Usage: `,banhistory USER_ID`");
    }

    return message.reply({
      embeds: [createBanHistory(message.guild.id, userId)]
    });
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString("userid");

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: "❌ सही Discord User ID डालो।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [createBanHistory(interaction.guild.id, userId)],
      ephemeral: true
    });
  }
};
