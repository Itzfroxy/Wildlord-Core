const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

async function unhideChannel(channel) {
  if (
    channel.type !== ChannelType.GuildText &&
    channel.type !== ChannelType.GuildAnnouncement
  ) {
    return "❌ यह Command केवल Text Channel में काम करता है।";
  }

  try {
    await channel.permissionOverwrites.edit(
      channel.guild.roles.everyone,
      { ViewChannel: null }
    );

    return `👀 ${channel} अब Members को Visible है।`;
  } catch (error) {
    console.error("Unhide error:", error);
    return "❌ Channel Unhide नहीं हुआ। Bot की Manage Channels Permission चेक करो।";
  }
}

module.exports = {
  name: "unhide",
  aliases: ["unhidechannel"],

  data: new SlashCommandBuilder()
    .setName("unhide")
    .setDescription("Make the current channel visible again")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हारे पास Manage Channels Permission नहीं है।");
    }

    return message.reply(await unhideChannel(message.channel));
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Manage Channels Permission नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply(await unhideChannel(interaction.channel));
  }
};
