
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getGuild, updateGuild } = require("../../utils/database");

async function approveRequest(guild, moderator, userId) {
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
    return "❌ इस User की कोई Pending Unban Request नहीं मिली।";
  }

  try {
    await guild.members.unban(
      userId,
      `Unban request approved by ${moderator.tag}`
    );
  } catch {
    return "❌ User Unban नहीं हो सका। हो सकता है वह पहले से Unbanned हो।";
  }

  request.status = "approved";
  request.reviewedBy = moderator.id;
  request.reviewedAt = new Date().toISOString();

  updateGuild(guild.id, { unbanRequests: requests });

  return `✅ <@${userId}> की Unban Request Approve कर दी गई और User Unban हो गया।`;
}

module.exports = {
  name: "approveunban",
  aliases: ["acceptunban"],

  data: new SlashCommandBuilder()
    .setName("approveunban")
    .setDescription("Approve an unban request")
    .addStringOption(option =>
      option.setName("userid")
        .setDescription("Discord User ID")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    const userId = args[0]?.replace(/[<@!>]/g, "");

    if (!/^\d{17,20}$/.test(userId || "")) {
      return message.reply("Usage: `,approveunban USER_ID`");
    }

    const result = await approveRequest(
      message.guild,
      message.author,
      userId
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString("userid");

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: "❌ सही Discord User ID डालो।",
        ephemeral: true
      });
    }

    const result = await approveRequest(
      interaction.guild,
      interaction.user,
      userId
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
