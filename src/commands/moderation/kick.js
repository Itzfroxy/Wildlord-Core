
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { sendModLog } = require("../../utils/modLogger");

async function kickMember(guild, target, moderator, reason) {
  const member = await guild.members.fetch(target.id).catch(() => null);
  const executor = await guild.members.fetch(moderator.id);

  if (!member) return "❌ Member इस Server में नहीं मिला।";

  if (member.id === moderator.id) {
    return "❌ तुम खुद को Kick नहीं कर सकते।";
  }

  if (member.id === guild.ownerId) {
    return "❌ Server Owner को Kick नहीं कर सकते।";
  }

  if (!executor.permissions.has(PermissionFlagsBits.KickMembers)) {
    return "❌ तुम्हारे पास Kick Members Permission नहीं है।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Kick नहीं कर सकते।";
  }

  if (!member.kickable) {
    return "❌ Bot इस Member को Kick नहीं कर सकता। Role Hierarchy चेक करो।";
  }

  try {
    await member.kick(reason);

    await sendModLog(guild, {
      action: "KICK",
      targetId: target.id,
      moderatorId: moderator.id,
      reason
    });

    return new EmbedBuilder()
      .setColor("#E74C3C")
      .setTitle("👢 Member Kicked")
      .addFields(
        { name: "Member", value: `${target.tag}`, inline: true },
        { name: "Moderator", value: `${moderator.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

  } catch (error) {
    console.error("Kick error:", error);
    return "❌ Kick करते समय Error आया।";
  }
}

module.exports = {
  name: "kick",
  aliases: ["remove"],

  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to kick")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for kick")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("❌ तुम्हारे पास Kick Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,kick @user [reason]`");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const result = await kickMember(
      message.guild,
      target,
      message.author,
      reason
    );

    return message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    const result = await kickMember(
      interaction.guild,
      target,
      interaction.user,
      reason
    );

    return interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
