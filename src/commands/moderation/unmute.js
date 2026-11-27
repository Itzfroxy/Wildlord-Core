const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function unmuteMember(guild, target, moderator) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.MuteMembers)) {
    return "❌ तुम्हारे पास Mute Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (!member.voice.channel) {
    return "❌ यह Member किसी Voice Channel में नहीं है।";
  }

  if (!member.voice.serverMute) {
    return "❌ यह Member Server Mute नहीं है।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Unmute नहीं कर सकते।";
  }

  if (!member.manageable) {
    return "❌ Bot इस Member को Unmute नहीं कर सकता।";
  }

  try {
    await member.voice.setMute(false, `Unmuted by ${moderator.tag}`);

    return `🔊 ${target.tag} को Voice में Unmute कर दिया गया।`;
  } catch (error) {
    console.error("Unmute error:", error);
    return "❌ Unmute नहीं हो पाया। Bot की Mute Members Permission चेक करो।";
  }
}

module.exports = {
  name: "unmute",
  aliases: ["voiceunmute"],

  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a member in voice channel")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to unmute")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async execute(message) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,unmute @user`");
    }

    const result = await unmuteMember(
      message.guild, target, message.author
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    const result = await unmuteMember(
      interaction.guild, target, interaction.user
    );

    return interaction.reply(result);
  }
};
