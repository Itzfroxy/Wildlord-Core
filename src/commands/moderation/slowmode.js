const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

async function setSlowmode(channel, seconds) {
  if (
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > 21600
  ) {
    return "❌ Slowmode 0 से 21600 सेकंड के बीच होना चाहिए।";
  }

  if (
    channel.type !== ChannelType.GuildText &&
    channel.type !== ChannelType.GuildAnnouncement
  ) {
    return "❌ यह Command केवल Text Channel में काम करता है।";
  }

  try {
    await channel.setRateLimitPerUser(seconds);

    return seconds === 0
      ? "✅ Slowmode बंद कर दिया गया।"
      : `✅ Slowmode **${seconds} सेकंड** पर सेट हो गया।`;
  } catch (error) {
    console.error("Slowmode error:", error);
    return "❌ Slowmode सेट नहीं हुआ। Bot की Manage Channels Permission चेक करो।";
  }
}

module.exports = {
  name: "slowmode",
  aliases: ["sm"],

  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode in this channel")
    .addIntegerOption(option =>
      option.setName("seconds")
        .setDescription("Slowmode seconds (0 to 21600)")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हारे पास Manage Channels Permission नहीं है।");
    }

    const seconds = Number(args[0]);

    if (!Number.isInteger(seconds)) {
      return message.reply("Usage: `,slowmode 5` (0 से 21600)");
    }

    const result = await setSlowmode(message.channel, seconds);
    return message.reply(result);
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Manage Channels Permission नहीं है।",
        ephemeral: true
      });
    }

    const seconds = interaction.options.getInteger("seconds");
    const result = await setSlowmode(interaction.channel, seconds);

    return interaction.reply(result);
  }
};
