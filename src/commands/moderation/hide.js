const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

async function hideChannel(channel) {
  if (
    channel.type !== ChannelType.GuildText &&
    channel.type !== ChannelType.GuildAnnouncement
  ) {
    return "❌ यह Command केवल Text Channel में काम करता है।";
  }

  try {
    await channel.permissionOverwrites.edit(
      channel.guild.roles.everyone,
      { ViewChannel: false }
    );

    return `🙈 ${channel} अब सामान्य Members से छिपा दिया गया है।`;
  } catch (error) {
    console.error("Hide error:", error);
    return "❌ Channel Hide नहीं हुआ। Bot की Manage Channels Permission चेक करो।";
  }
}

module.exports = {
  name: "hide",
  aliases: ["hidechannel"],

  data: new SlashCommandBuilder()
    .setName("hide")
    .setDescription("Hide the current channel from everyone")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हारे पास Manage Channels Permission नहीं है।");
    }

    return message.reply(await hideChannel(message.channel));
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Manage Channels Permission नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply(await hideChannel(interaction.channel));
  }
};
