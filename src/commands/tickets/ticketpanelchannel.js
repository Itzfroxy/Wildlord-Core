const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const { saveTicketConfig } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketpanelchannel",
  aliases: ["tpanelchannel", "setticketpanel"],

  data: new SlashCommandBuilder()
    .setName("ticketpanelchannel")
    .setDescription("Set the ticket panel channel")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel for the ticket panel")
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
      panelChannelId: channel.id
    });

    return message.reply(`✅ Ticket Panel Channel सेट हो गया: ${channel}`);
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
      panelChannelId: channel.id
    });

    return interaction.reply({
      content: `✅ Ticket Panel Channel सेट हो गया: ${channel}`,
      ephemeral: true
    });
  }
};
