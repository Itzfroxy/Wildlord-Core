const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketfeedbacktop",
  aliases: ["tfeedbacktop"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbacktop")
    .setDescription("View top rated ticket feedback"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const tickets = getTicketData(message.guild.id).tickets || [];

    const feedbacks = tickets
      .filter(ticket => ticket.feedback)
      .sort((a, b) => b.feedback.rating - a.feedback.rating)
      .slice(0, 10);

    if (!feedbacks.length) {
      return message.reply("📭 कोई Feedback उपलब्ध नहीं है।");
    }

    const embed = new EmbedBuilder()
      .setColor("#F1C40F")
      .setTitle("🏆 Top Ticket Feedback")
      .setDescription(
        feedbacks.map((ticket, index) =>
          `**${index + 1}.** <@${ticket.feedback.userId}> — ` +
          `${ticket.feedback.rating}/5 ⭐\n` +
          `Ticket: <#${ticket.channelId}>`
        ).join("\n\n")
      );

    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Channels permission चाहिए।",
        ephemeral: true
      });
    }

    const tickets = getTicketData(interaction.guild.id).tickets || [];

    const feedbacks = tickets
      .filter(ticket => ticket.feedback)
      .sort((a, b) => b.feedback.rating - a.feedback.rating)
      .slice(0, 10);

    if (!feedbacks.length) {
      return interaction.reply({
        content: "📭 कोई Feedback उपलब्ध नहीं है।",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#F1C40F")
      .setTitle("🏆 Top Ticket Feedback")
      .setDescription(
        feedbacks.map((ticket, index) =>
          `**${index + 1}.** <@${ticket.feedback.userId}> — ` +
          `${ticket.feedback.rating}/5 ⭐\n` +
          `Ticket: <#${ticket.channelId}>`
        ).join("\n\n")
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
