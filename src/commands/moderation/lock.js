const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

async function lockChannel(channel) {
  if (
    channel.type !== ChannelType.GuildText &&
    channel.type !== ChannelType.GuildAnnouncement
  ) {
    return "❌ यह Command केवल Text Channel में काम करता है।";
  }

  try {
    await channel.permissionOverwrites.edit(
      channel.guild.roles.everyone,
      { SendMessages: false }
    );

    return `🔒 ${channel} Successfully Locked!`;
  } catch (error) {
    console.error("Lock error:", error);
    return "❌ Channel Lock नहीं हुआ। Bot की Manage Channels Permission चेक करो।";
  }
}

module.exports = {
  name: "lock",
  aliases: ["lockdown"],

  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock the current text channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हारे पास Manage Channels Permission नहीं है।");
    }

    return message.reply(
      await lockChannel(message.channel)
    );
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Manage Channels Permission नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply(
      await lockChannel(interaction.channel)
    );
  }
};
