const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function disconnectMember(guild, target, moderator) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.MoveMembers)) {
    return "❌ तुम्हारे पास Move Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (!member.voice.channel) {
    return "❌ यह Member किसी Voice Channel में नहीं है।";
  }

  if (target.id === moderator.id) {
    return "❌ तुम खुद को Disconnect नहीं कर सकते।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Disconnect नहीं कर सकते।";
  }

  try {
    await member.voice.disconnect(`Disconnected by ${moderator.tag}`);

    return `✅ ${target.tag} को Voice Channel से Disconnect कर दिया गया।`;
  } catch (error) {
    console.error("Disconnect error:", error);
    return "❌ Disconnect नहीं हुआ। Bot की Move Members Permission चेक करो।";
  }
}

module.exports = {
  name: "disconnect",
  aliases: ["dc", "vdisconnect"],

  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnect a member from voice channel")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to disconnect")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  async execute(message) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,disconnect @user`");
    }

    const result = await disconnectMember(
      message.guild, target, message.author
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    const result = await disconnectMember(
      interaction.guild, target, interaction.user
    );

    return interaction.reply(result);
  }
};
