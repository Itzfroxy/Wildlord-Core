const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

async function moveMember(guild, target, moderator, channel) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.MoveMembers)) {
    return "❌ तुम्हारे पास Move Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";

  if (!member.voice.channel) {
    return "❌ Member किसी Voice Channel में नहीं है।";
  }

  if (!channel || channel.guild.id !== guild.id) {
    return "❌ सही Voice Channel चुनो।";
  }

  if (
    channel.type !== ChannelType.GuildVoice &&
    channel.type !== ChannelType.GuildStageVoice
  ) {
    return "❌ Destination Voice Channel होना चाहिए।";
  }

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Move नहीं कर सकते।";
  }

  if (!member.moderatable) {
    return "❌ Bot इस Member को Manage नहीं कर सकता।";
  }

  try {
    await member.voice.setChannel(
      channel,
      `Moved by ${moderator.tag}`
    );

    return `✅ ${target.tag} को ${channel} में Move कर दिया गया।`;
  } catch (error) {
    console.error("Move error:", error);
    return "❌ Member Move नहीं हुआ। Bot की Move Members Permission चेक करो।";
  }
}

module.exports = {
  name: "move",
  aliases: ["movemember"],

  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move a member to another voice channel")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to move")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Destination voice channel")
        .addChannelTypes(
          ChannelType.GuildVoice,
          ChannelType.GuildStageVoice
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  async execute(message) {
    const target = message.mentions.users.first();
    const channel = message.mentions.channels.first();

    if (!target || !channel) {
      return message.reply("Usage: `,move @user #voice-channel`");
    }

    const result = await moveMember(
      message.guild,
      target,
      message.author,
      channel
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const channel = interaction.options.getChannel("channel");

    const result = await moveMember(
      interaction.guild,
      target,
      interaction.user,
      channel
    );

    return interaction.reply(result);
  }
};
