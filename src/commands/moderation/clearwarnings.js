const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");

async function clearWarnings(guild, target, moderator) {
  const executor = await guild.members.fetch(moderator.id);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  const userData = getUser(guild.id, target.id);
  const warnings = userData.warnings || [];

  if (warnings.length === 0) {
    return "❌ इस Member की कोई Warning मौजूद नहीं है।";
  }

  updateUser(guild.id, target.id, {
    warnings: []
  });

  return new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle("✅ Warnings Cleared")
    .addFields(
      { name: "Member", value: target.tag, inline: true },
      { name: "Moderator", value: moderator.tag, inline: true },
      { name: "Removed Warnings", value: `${warnings.length}`, inline: true }
    )
    .setTimestamp();
}

module.exports = {
  name: "clearwarnings",
  aliases: ["clearwarns", "resetwarns"],

  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings of a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member whose warnings to clear")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,clearwarnings @user`");
    }

    const result = await clearWarnings(
      message.guild, target, message.author
    );

    return message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    const result = await clearWarnings(
      interaction.guild, target, interaction.user
    );

    return interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
