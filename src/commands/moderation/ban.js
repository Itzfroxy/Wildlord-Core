const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

async function banMember(guild, target, moderator, reason) {
  const member = await guild.members.fetch(target.id).catch(() => null);
  const executor = await guild.members.fetch(moderator.id);

  if (target.id === moderator.id) {
    return "❌ तुम खुद को Ban नहीं कर सकते।";
  }

  if (target.id === guild.ownerId) {
    return "❌ Server Owner को Ban नहीं कर सकते।";
  }

  if (
    member &&
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Ban नहीं कर सकते।";
  }

  if (member && !member.bannable) {
    return "❌ Bot इस Member को Ban नहीं कर सकता।";
  }

  try {
    await guild.members.ban(target.id, {
      reason: `${reason} | Moderator: ${moderator.tag}`
    });

    return new EmbedBuilder()
      .setColor("#E74C3C")
      .setTitle("🔨 Member Banned")
      .addFields(
        { name: "Member", value: target.tag, inline: true },
        { name: "Moderator", value: moderator.tag, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

  } catch (error) {
    console.error("Ban error:", error);
    return "❌ Ban करते समय Error आया।";
  }
}

module.exports = {
  name: "ban",
  aliases: ["hammer"],

  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to ban")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for ban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ तुम्हारे पास Ban Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,ban @user [reason]`");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const result = await banMember(
      message.guild,
      target,
      message.author,
      reason
    );

    await message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const result = await banMember(
      interaction.guild,
      target,
      interaction.user,
      reason
    );

    await interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
