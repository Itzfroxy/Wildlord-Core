const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketpriority",
  aliases: ["tpriority", "priority"],

  data: new SlashCommandBuilder()
    .setName("ticketpriority")
    .setDescription("Set ticket priority")
    .addStringOption(option =>
      option.setName("level")
        .setDescription("Priority level")
        .setRequired(true)
        .addChoices(
          { name: "Low", value: "Low" },
          { name: "Medium", value: "Medium" },
          { name: "High", value: "High" }
        )
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    const level = args[0]?.toLowerCase();

    const priorities = {
      low: "Low",
      medium: "Medium",
      high: "High"
    };

    if (!priorities[level]) {
      return message.reply("❌ low, medium या high डालो।");
    }

    ticket.priority = priorities[level];

    saveTicket(message.guild.id, ticket);

    return message.reply(
      `✅ Ticket Priority **${priorities[level]}** सेट कर दी गई।`
    );
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Channels permission चाहिए।",
        ephemeral: true
      });
    }

    const ticket = getTicket(
      interaction.guild.id,
      interaction.channel.id
    );

    if (!ticket) {
      return interaction.reply({
        content: "❌ यह Ticket Channel नहीं है।",
        ephemeral: true
      });
    }

    const level = interaction.options.getString("level");

    ticket.priority = level;

    saveTicket(interaction.guild.id, ticket);

    return interaction.reply(
      `✅ Ticket Priority **${level}** सेट कर दी गई।`
    );
  }
};
