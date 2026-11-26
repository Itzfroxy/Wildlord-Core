const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function muteMember(guild, target, moderator) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.MuteMembers)) {
    return "❌ तुम्हारे पास Mute Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (!member.voice.channel) {
    return "❌ यह Member किसी Voice Channel में नहीं है।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Mute नहीं कर सकते।";
  }

  if (!member.muteable) {
    return "❌ Bot इस Member को Mute नहीं कर सकता।";
  }

  try {
    await member.voice.setMute(true, `Muted by ${moderator.tag}`);
    return `🔇 ${target.tag} को Voice में Mute कर दिया गया।`;
  } catch (error) {
    console.error("Mute error:", error);
    return "❌ Mute नहीं हो पाया। Bot की Mute Members Permission चेक करो।";
  }
}

module.exports = {
  name: "mute",
  aliases: ["voicemute"],

  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member in voice channel")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to mute")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(message) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,mute @user`");
    }

    const result = await muteMember(
      message.guild, target, message.author
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    const result = await muteMember(
      interaction.guild, target, interaction.user
    );

    return interaction.reply(result);
  }
};
