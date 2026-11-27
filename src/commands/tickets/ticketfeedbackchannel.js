const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const { saveTicketConfig } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketfeedbackchannel",
  aliases: ["tfeedbackchannel"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbackchannel")
    .setDescription("Set ticket feedback log channel")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Feedback log channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ तुम्हें Manage Server permission चाहिए।");
    }

    const channel = message.guild.channels.cache.get(args[0]);

    if (!channel || channel.type !== ChannelType.GuildText) {
      return message.reply("❌ सही Text Channel ID डालो।");
    }

    saveTicketConfig(message.guild.id, {
      feedbackChannelId: channel.id
    });

    return message.reply(
      `✅ Feedback Log Channel सेट हो गया: ${channel}`
    );
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Server permission चाहिए।",
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel("channel");

    saveTicketConfig(interaction.guild.id, {
      feedbackChannelId: channel.id
    });

    return interaction.reply({
      content: `✅ Feedback Log Channel सेट हो गया: ${channel}`,
      ephemeral: true
    });
  }
};
