const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketfeedback",
  aliases: ["tfeedback"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedback")
    .setDescription("Submit feedback for a ticket")
    .addIntegerOption(option =>
      option.setName("rating")
        .setDescription("Rating from 1 to 5")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(option =>
      option.setName("comment")
        .setDescription("Optional feedback comment")
        .setRequired(false)
    ),

  async execute(message, args) {
    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    if (ticket.ownerId !== message.author.id) {
      return message.reply("❌ केवल Ticket Owner Feedback दे सकता है।");
    }

    if (ticket.status !== "closed") {
      return message.reply("❌ Feedback देने के लिए Ticket बंद होना चाहिए।");
    }

    const rating = Number(args[0]);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return message.reply("❌ Rating 1 से 5 के बीच डालो।");
    }

    const comment = args.slice(1).join(" ").trim();

    ticket.feedback = {
      rating,
      comment,
      userId: message.author.id,
      createdAt: Date.now()
    };

    saveTicket(message.guild.id, ticket);

    return message.reply(`✅ Feedback सेव हो गया! Rating: ${rating}/5`);
  },

  async executeSlash(interaction) {
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

    if (ticket.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: "❌ केवल Ticket Owner Feedback दे सकता है।",
        ephemeral: true
      });
    }

    if (ticket.status !== "closed") {
      return interaction.reply({
        content: "❌ Feedback देने के लिए Ticket बंद होना चाहिए।",
        ephemeral: true
      });
    }

    const rating = interaction.options.getInteger("rating");
    const comment = interaction.options.getString("comment") || "";

    ticket.feedback = {
      rating,
      comment,
      userId: interaction.user.id,
      createdAt: Date.now()
    };

    saveTicket(interaction.guild.id, ticket);

    return interaction.reply({
      content: `✅ Feedback सेव हो गया! Rating: ${rating}/5`,
      ephemeral: true
    });
  }
};
