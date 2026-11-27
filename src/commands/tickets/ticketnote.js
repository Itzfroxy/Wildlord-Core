
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketnote",
  aliases: ["tnote"],

  data: new SlashCommandBuilder()
    .setName("ticketnote")
    .setDescription("Add a staff note to a ticket")
    .addStringOption(option =>
      option.setName("note")
        .setDescription("Staff note")
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    const noteText = args.join(" ").trim();

    if (!noteText) {
      return message.reply("❌ Note लिखो।");
    }

    if (!Array.isArray(ticket.notes)) {
      ticket.notes = [];
    }

    ticket.notes.push({
      authorId: message.author.id,
      text: noteText,
      createdAt: Date.now()
    });

    saveTicket(message.guild.id, ticket);

    return message.reply("✅ Staff Note सेव हो गया।");
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

    const noteText = interaction.options.getString("note").trim();

    if (!noteText) {
      return interaction.reply({
        content: "❌ Note लिखो।",
        ephemeral: true
      });
    }

    if (!Array.isArray(ticket.notes)) {
      ticket.notes = [];
    }

    ticket.notes.push({
      authorId: interaction.user.id,
      text: noteText,
      createdAt: Date.now()
    });

    saveTicket(interaction.guild.id, ticket);

    return interaction.reply({
      content: "✅ Staff Note सेव हो गया।",
      ephemeral: true
    });
  }
};
