const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function softbanMember(guild, target, moderator, reason) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.BanMembers)) {
    return "❌ तुम्हारे पास Ban Members Permission नहीं है।";
  }

  if (target.id === moderator.id) {
    return "❌ तुम खुद को Softban नहीं कर सकते।";
  }

  if (target.id === guild.ownerId) {
    return "❌ Server Owner को Softban नहीं कर सकते।";
  }

  if (!member) {
    return "❌ Member Server में नहीं मिला।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Softban नहीं कर सकते।";
  }

  if (!member.bannable) {
    return "❌ Bot इस Member को Ban नहीं कर सकता।";
  }

  try {
    await guild.members.ban(target.id, {
      deleteMessageSeconds: 604800,
      reason
    });

    await guild.members.unban(
      target.id,
      `Softban completed by ${moderator.tag}`
    );

    return `✅ **${target.tag}** को Softban करके तुरंत Unban कर दिया गया।`;
  } catch (error) {
    console.error("Softban error:", error);
    return "❌ Softban पूरा नहीं हुआ। Bot की Ban Members Permission चेक करो।";
  }
}

module.exports = {
  name: "softban",
  aliases: ["sb"],

  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("Ban and immediately unban a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to softban")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for softban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,softban @user [reason]`");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const result = await softbanMember(
      message.guild, target, message.author, reason
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const result = await softbanMember(
      interaction.guild, target, interaction.user, reason
    );

    return interaction.reply(result);
  }
};
