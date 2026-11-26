
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

function createHistory(guildId, userId) {
  const guildData = getGuild(guildId);

  const history = (guildData.unbanRequests || [])
    .filter(request => request.userId === userId)
    .slice(-10)
    .reverse();

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("📜 Unban Request History")
    .setDescription(`User ID: \`${userId}\``)
    .setTimestamp();

  if (!history.length) {
    embed.setDescription("इस User की कोई Unban Request History नहीं मिली।");
    return embed;
  }

  history.forEach((request, index) => {
    embed.addFields({
      name: `Request ${index + 1} — ${request.status.toUpperCase()}`,
      value:
        `**Reason:** ${request.reason || "No reason"}\n` +
        `**Submitted:** <t:${Math.floor(new Date(request.date).getTime() / 1000)}:R>\n` +
        `**Reviewed By:** ${request.reviewedBy ? `<@${request.reviewedBy}>` : "Not reviewed"}`
    });
  });

  return embed;
}

module.exports = {
  name: "unbanhistory",
  aliases: ["ubhistory"],

  data: new SlashCommandBuilder()
    .setName("unbanhistory")
    .setDescription("View a user's unban request history")
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
      return message.reply("Usage: `,unbanhistory USER_ID`");
    }

    return message.reply({
      embeds: [createHistory(message.guild.id, userId)]
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
      embeds: [createHistory(interaction.guild.id, userId)],
      ephemeral: true
    });
  }
};
