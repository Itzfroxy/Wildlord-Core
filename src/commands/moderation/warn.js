const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");

async function warnMember(guild, target, moderator, reason) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";
  if (target.id === moderator.id) return "❌ तुम खुद को Warn नहीं कर सकते।";
  if (target.id === guild.ownerId) return "❌ Server Owner को Warn नहीं कर सकते।";

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Warn नहीं कर सकते।";
  }

  const userData = getUser(guild.id, target.id);
  const warnings = userData.warnings || [];

  const warning = {
    id: Date.now().toString(),
    reason,
    moderatorId: moderator.id,
    date: new Date().toISOString()
  };

  warnings.push(warning);

  updateUser(guild.id, target.id, { warnings });

  const embed = new EmbedBuilder()
    .setColor("#E67E22")
    .setTitle("⚠️ Member Warned")
    .addFields(
      { name: "Member", value: target.tag, inline: true },
      { name: "Moderator", value: moderator.tag, inline: true },
      { name: "Total Warnings", value: `${warnings.length}`, inline: true },
      { name: "Reason", value: reason }
    )
    .setTimestamp();

  return embed;
}

module.exports = {
  name: "warn",
  aliases: ["warning"],

  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Give a warning to a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to warn")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for warning")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,warn @user [reason]`");
    }

    const reason = args.slice(1).join(" ");

    if (!reason) {
      return message.reply("❌ Warning का Reason देना जरूरी है।");
    }

    const result = await warnMember(
      message.guild, target, message.author, reason
    );

    await message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const result = await warnMember(
      interaction.guild, target, interaction.user, reason
    );

    await interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
