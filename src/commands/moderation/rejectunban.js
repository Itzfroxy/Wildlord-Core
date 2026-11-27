
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getGuild, updateGuild } = require("../../utils/database");

async function rejectRequest(guild, moderator, userId, reason) {
  const member = await guild.members.fetch(moderator.id);

  if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
    return "❌ तुम्हारे पास Ban Members Permission नहीं है।";
  }

  const guildData = getGuild(guild.id);
  const requests = guildData.unbanRequests || [];

  const request = requests.find(item =>
    item.userId === userId && item.status === "pending"
  );

  if (!request) {
    return "❌ इस User की कोई Pending Request नहीं मिली।";
  }

  request.status = "rejected";
  request.reviewedBy = moderator.id;
  request.reviewedAt = new Date().toISOString();
  request.rejectionReason = reason || "No reason provided";

  updateGuild(guild.id, { unbanRequests: requests });

  return `❌ <@${userId}> की Unban Request Reject कर दी गई।\n**Reason:** ${request.rejectionReason}`;
}

module.exports = {
  name: "rejectunban",
  aliases: ["denyunban"],

  data: new SlashCommandBuilder()
    .setName("rejectunban")
    .setDescription("Reject a pending unban request")
    .addStringOption(option =>
      option.setName("userid")
        .setDescription("Discord User ID")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for rejection")
        .setRequired(false)
        .setMaxLength(500)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    const userId = args[0]?.replace(/[<@!>]/g, "");

    if (!/^\d{17,20}$/.test(userId || "")) {
      return message.reply("Usage: `,rejectunban USER_ID [reason]`");
    }

    const reason = args.slice(1).join(" ");

    const result = await rejectRequest(
      message.guild,
      message.author,
      userId,
      reason
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString("userid");
    const reason = interaction.options.getString("reason");

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: "❌ सही Discord User ID डालो।",
        ephemeral: true
      });
    }

    const result = await rejectRequest(
      interaction.guild,
      interaction.user,
      userId,
      reason
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
