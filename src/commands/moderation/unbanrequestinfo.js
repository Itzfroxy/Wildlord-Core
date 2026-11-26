
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

function getRequestInfo(guildId, userId) {
  const guildData = getGuild(guildId);
  const requests = (guildData.unbanRequests || [])
    .filter(request => request.userId === userId);

  if (!requests.length) {
    return null;
  }

  const request = requests[requests.length - 1];

  const colors = {
    pending: "#F1C40F",
    approved: "#2ECC71",
    rejected: "#E74C3C"
  };

  return new EmbedBuilder()
    .setColor(colors[request.status] || "#5865F2")
    .setTitle("📨 Unban Request Information")
    .addFields(
      { name: "User", value: `<@${userId}>`, inline: true },
      { name: "Status", value: request.status.toUpperCase(), inline: true },
      { name: "Request Reason", value: request.reason || "No reason provided" },
      {
        name: "Submitted",
        value: `<t:${Math.floor(new Date(request.date).getTime() / 1000)}:R>`
      },
      {
        name: "Reviewed By",
        value: request.reviewedBy ? `<@${request.reviewedBy}>` : "Not reviewed"
      },
      {
        name: "Review Reason",
        value: request.rejectionReason || "No rejection reason"
      }
    )
    .setTimestamp();
}

module.exports = {
  name: "unbanrequestinfo",
  aliases: ["ubrequestinfo", "checkunban"],

  data: new SlashCommandBuilder()
    .setName("unbanrequestinfo")
    .setDescription("View a user's latest unban request")
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
      return message.reply("Usage: `,unbanrequestinfo USER_ID`");
    }

    const embed = getRequestInfo(message.guild.id, userId);

    if (!embed) {
      return message.reply("❌ इस User की कोई Unban Request नहीं मिली।");
    }

    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString("userid");

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: "❌ सही Discord User ID डालो।",
        ephemeral: true
      });
    }

    const embed = getRequestInfo(interaction.guild.id, userId);

    if (!embed) {
      return interaction.reply({
        content: "❌ इस User की कोई Unban Request नहीं मिली।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
