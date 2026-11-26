const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function deafenMember(guild, target, moderator) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.DeafenMembers)) {
    return "❌ तुम्हारे पास Deafen Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (!member.voice.channel) {
    return "❌ यह Member किसी Voice Channel में नहीं है।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Deafen नहीं कर सकते।";
  }

  try {
    await member.voice.setDeaf(true, `Deafened by ${moderator.tag}`);
    return `🔇 ${target.tag} को Voice Channel में Deafen कर दिया गया।`;
  } catch (error) {
    console.error("Deafen error:", error);
    return "❌ Deafen नहीं हो पाया। Bot की Deafen Members Permission चेक करो।";
  }
}

module.exports = {
  name: "deafen",
  aliases: ["deaf"],

  data: new SlashCommandBuilder()
    .setName("deafen")
    .setDescription("Deafen a member in voice channel")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to deafen")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),

  async execute(message) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,deafen @user`");
    }

    const result = await deafenMember(
      message.guild, target, message.author
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    const result = await deafenMember(
      interaction.guild, target, interaction.user
    );

    return interaction.reply(result);
  }
};
