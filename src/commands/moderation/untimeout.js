
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { sendModLog } = require("../../utils/modLogger");

async function removeTimeout(guild, target, moderator, reason) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (member.id === moderator.id) {
    return "❌ तुम खुद का Timeout नहीं हटा सकते।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member का Timeout नहीं हटा सकते।";
  }

  if (!member.isCommunicationDisabled()) {
    return "❌ इस Member पर अभी Timeout लगा ही नहीं है।";
  }

  if (!member.moderatable) {
    return "❌ Bot इस Member का Timeout नहीं हटा सकता।";
  }

  try {
    await member.timeout(null, reason);

    await sendModLog(guild, {
      action: "UNTIMEOUT",
      targetId: target.id,
      moderatorId: moderator.id,
      reason
    });

    return new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("🔊 Timeout Removed")
      .addFields(
        { name: "Member", value: target.tag, inline: true },
        { name: "Moderator", value: moderator.tag, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

  } catch (error) {
    console.error("Untimeout error:", error);
    return "❌ Timeout हटाते समय Error आया।";
  }
}

module.exports = {
  name: "untimeout",
  aliases: ["unmute", "unsilence"],

  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove a member's timeout")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member whose timeout to remove")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,untimeout @user [reason]`");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const result = await removeTimeout(
      message.guild, target, message.author, reason
    );

    return message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    const result = await removeTimeout(
      interaction.guild, target, interaction.user, reason
    );

    return interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
