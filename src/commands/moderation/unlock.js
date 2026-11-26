const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

async function unlockChannel(channel) {
  if (
    channel.type !== ChannelType.GuildText &&
    channel.type !== ChannelType.GuildAnnouncement
  ) {
    return "❌ यह Command केवल Text Channel में काम करता है।";
  }

  try {
    await channel.permissionOverwrites.edit(
      channel.guild.roles.everyone,
      { SendMessages: null }
    );

    return `🔓 ${channel} Successfully Unlocked!`;
  } catch (error) {
    console.error("Unlock error:", error);
    return "❌ Channel Unlock नहीं हुआ। Bot की Manage Channels Permission चेक करो।";
  }
}

module.exports = {
  name: "unlock",
  aliases: ["unlockdown"],

  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock the current text channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हारे पास Manage Channels Permission नहीं है।");
    }

    return message.reply(
      await unlockChannel(message.channel)
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
      await unlockChannel(interaction.channel)
    );
  }
};
