const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

async function unbanMember(guild, userId, moderator, reason) {
  const executor = await guild.members.fetch(moderator.id);

  if (!executor.permissions.has(PermissionFlagsBits.BanMembers)) {
    return "❌ तुम्हारे पास Ban Members Permission नहीं है।";
  }

  try {
    const ban = await guild.bans.fetch(userId).catch(() => null);

    if (!ban) {
      return "❌ यह User Server की Ban List में नहीं है।";
    }

    await guild.members.unban(userId, reason);

    return new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("🔓 Member Unbanned")
      .addFields(
        { name: "User", value: ban.user.tag, inline: true },
        { name: "Moderator", value: moderator.tag, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

  } catch (error) {
    console.error("Unban error:", error);
    return "❌ Unban करते समय Error आया।";
  }
}

module.exports = {
  name: "unban",
  aliases: ["pardon"],

  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Remove a user's server ban")
    .addStringOption(option =>
      option.setName("userid")
        .setDescription("Banned user's Discord ID")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for unban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    const userId = args[0];

    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ तुम्हारे पास Ban Permission नहीं है।");
    }

    if (!/^\d{17,20}$/.test(userId || "")) {
      return message.reply("Usage: `,unban USER_ID [reason]`");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const result = await unbanMember(
      message.guild,
      userId,
      message.author,
      reason
    );

    await message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString("userid");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: "❌ Invalid User ID.",
        ephemeral: true
      });
    }

    const result = await unbanMember(
      interaction.guild,
      userId,
      interaction.user,
      reason
    );

    await interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
