const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function changeNickname(guild, target, moderator, nickname) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.ManageNicknames)) {
    return "❌ तुम्हारे पास Manage Nicknames Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member का Nickname नहीं बदल सकते।";
  }

  if (!member.manageable) {
    return "❌ Bot इस Member का Nickname नहीं बदल सकता।";
  }

  try {
    await member.setNickname(nickname || null);

    return nickname
      ? `✅ ${target.tag} का Nickname **${nickname}** कर दिया गया।`
      : `✅ ${target.tag} का Nickname Reset कर दिया गया।`;
  } catch (error) {
    console.error("Nickname error:", error);
    return "❌ Nickname बदलते समय Error आया।";
  }
}

module.exports = {
  name: "nickname",
  aliases: ["nick"],

  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Change or reset a member's nickname")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("name")
        .setDescription("New nickname (leave empty to reset)")
        .setMaxLength(32)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(message, args) {
    if (!message.mentions.users.first()) {
      return message.reply("Usage: `,nickname @user NewName`");
    }

    const target = message.mentions.users.first();
    const nickname = args.slice(1).join(" ").trim();

    const result = await changeNickname(
      message.guild, target, message.author, nickname
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const nickname = interaction.options.getString("name") || "";

    const result = await changeNickname(
      interaction.guild, target, interaction.user, nickname
    );

    return interaction.reply(result);
  }
};
