
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const {
  getTicket,
  saveTicket,
  getTicketData
} = require("../../utils/ticketManager");

module.exports = {
  name: "ticketfeedback",
  aliases: ["tfeedback"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedback")
    .setDescription("Submit feedback for a closed ticket")
    .addIntegerOption(option =>
      option.setName("rating")
        .setDescription("Rating from 1 to 5")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(option =>
      option.setName("comment")
        .setDescription("Feedback comment")
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

    if (ticket.feedback) {
      return message.reply("❌ इस Ticket का Feedback पहले ही दिया जा चुका है।");
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

    await sendFeedbackLog(message.guild, ticket);

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

    if (ticket.feedback) {
      return interaction.reply({
        content: "❌ इस Ticket का Feedback पहले ही दिया जा चुका है।",
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

    await sendFeedbackLog(interaction.guild, ticket);

    return interaction.reply({
      content: `✅ Feedback सेव हो गया! Rating: ${rating}/5`,
      ephemeral: true
    });
  }
};

async function sendFeedbackLog(guild, ticket) {
  const config = getTicketData(guild.id).ticketConfig;

  if (!config.feedbackChannelId) return;

  const channel = guild.channels.cache.get(config.feedbackChannelId);

  if (!channel || !channel.isTextBased()) return;

  const feedback = ticket.feedback;

  const embed = new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("⭐ New Ticket Feedback")
    .addFields(
      { name: "Ticket Owner", value: `<@${ticket.ownerId}>`, inline: true },
      { name: "Rating", value: `${feedback.rating}/5 ⭐`, inline: true },
      { name: "Ticket Channel", value: `<#${ticket.channelId}>`, inline: true },
      { name: "Comment", value: feedback.comment || "No comment" }
    )
    .setTimestamp(new Date(feedback.createdAt));

  await channel.send({ embeds: [embed] }).catch(() => null);
}
