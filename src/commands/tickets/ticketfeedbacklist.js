const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketfeedbacklist",
  aliases: ["tfeedbacklist"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbacklist")
    .setDescription("List all ticket feedback"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const data = getTicketData(message.guild.id);
    const tickets = Object.values(data.tickets || {});

    const feedbacks = tickets
      .filter(ticket => ticket.feedback)
      .sort((a, b) => b.feedback.createdAt - a.feedback.createdAt)
      .slice(0, 10);

    if (!feedbacks.length) {
      return message.reply("📭 कोई Ticket Feedback उपलब्ध नहीं है।");
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📋 Recent Ticket Feedback")
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

    const data = getTicketData(interaction.guild.id);
    const tickets = Object.values(data.tickets || {});

    const feedbacks = tickets
      .filter(ticket => ticket.feedback)
      .sort((a, b) => b.feedback.createdAt - a.feedback.createdAt)
      .slice(0, 10);

    if (!feedbacks.length) {
      return interaction.reply({
        content: "📭 कोई Ticket Feedback उपलब्ध नहीं है।",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📋 Recent Ticket Feedback")
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
