const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketremovenote",
  aliases: ["trmnote"],

  data: new SlashCommandBuilder()
    .setName("ticketremovenote")
    .setDescription("Remove a staff note from this ticket")
    .addIntegerOption(option =>
      option.setName("number")
        .setDescription("Note number to remove")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    if (!Array.isArray(ticket.notes) || !ticket.notes.length) {
      return message.reply("❌ इस Ticket में कोई Staff Note नहीं है।");
    }

    const number = parseInt(args[0], 10);

    if (!Number.isInteger(number) || number < 1 || number > ticket.notes.length) {
      return message.reply("❌ सही Note Number डालो।");
    }

    ticket.notes.splice(number - 1, 1);
    saveTicket(message.guild.id, ticket);

    return message.reply(`✅ Note #${number} हटा दिया गया।`);
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

    if (!Array.isArray(ticket.notes) || !ticket.notes.length) {
      return interaction.reply({
        content: "❌ इस Ticket में कोई Staff Note नहीं है।",
        ephemeral: true
      });
    }

    const number = interaction.options.getInteger("number");

    if (number > ticket.notes.length) {
      return interaction.reply({
        content: "❌ इतना Note Number मौजूद नहीं है।",
        ephemeral: true
      });
    }

    ticket.notes.splice(number - 1, 1);
    saveTicket(interaction.guild.id, ticket);

    return interaction.reply({
      content: `✅ Note #${number} हटा दिया गया।`,
      ephemeral: true
    });
  }
};
