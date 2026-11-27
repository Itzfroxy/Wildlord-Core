const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketfeedbackclear",
  aliases: ["tfeedbackclear"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbackclear")
    .setDescription("Clear feedback from this ticket"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    if (!ticket.feedback) {
      return message.reply("❌ इस Ticket में Feedback मौजूद नहीं है।");
    }

    delete ticket.feedback;

    saveTicket(message.guild.id, ticket);

    return message.reply("✅ Ticket Feedback हटा दिया गया।");
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

    if (!ticket.feedback) {
      return interaction.reply({
        content: "❌ इस Ticket में Feedback मौजूद नहीं है।",
        ephemeral: true
      });
    }

    delete ticket.feedback;

    saveTicket(interaction.guild.id, ticket);

    return interaction.reply({
      content: "✅ Ticket Feedback हटा दिया गया।",
      ephemeral: true
    });
  }
};
