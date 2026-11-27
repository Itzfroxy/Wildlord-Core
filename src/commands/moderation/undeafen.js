const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function undeafenMember(guild, target, moderator) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.DeafenMembers)) {
    return "❌ तुम्हारे पास Deafen Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (!member.voice.channel) {
    return "❌ यह Member किसी Voice Channel में नहीं है।";
  }

  if (!member.voice.serverDeaf) {
    return "❌ यह Member Server Deafen नहीं है।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Undeafen नहीं कर सकते।";
  }

  try {
    await member.voice.setDeaf(false, `Undeafened by ${moderator.tag}`);
    return `🔊 ${target.tag} को Undeafen कर दिया गया।`;
  } catch (error) {
    console.error("Undeafen error:", error);
    return "❌ Undeafen नहीं हो पाया। Bot की Deafen Members Permission चेक करो।";
  }
}

module.exports = {
  name: "undeafen",
  aliases: ["undeaf"],

  data: new SlashCommandBuilder()
    .setName("undeafen")
    .setDescription("Remove server deafen from a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to undeafen")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),

  async execute(message) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,undeafen @user`");
    }

    const result = await undeafenMember(
      message.guild, target, message.author
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    const result = await undeafenMember(
      interaction.guild, target, interaction.user
    );

    return interaction.reply(result);
  }
};
