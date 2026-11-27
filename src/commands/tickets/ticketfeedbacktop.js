
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

function createFeedbackEmbed(guildId) {
  const tickets = getTicketData(guildId).tickets;

  const feedbacks = tickets
    .filter(ticket =>
      ticket.feedback &&
      Number.isInteger(Number(ticket.feedback.rating)) &&
      Number(ticket.feedback.rating) >= 1 &&
      Number(ticket.feedback.rating) <= 5
    )
    .sort((a, b) =>
      Number(b.feedback.rating) - Number(a.feedback.rating)
    )
    .slice(0, 10);

  if (!feedbacks.length) return null;

  return new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("🏆 Top Ticket Feedback")
    .setDescription(
      feedbacks.map((ticket, index) =>
        `**${index + 1}.** <@${ticket.feedback.userId || "0"}> — ` +
        `${ticket.feedback.rating}/5 ⭐\n` +
        `Ticket: <#${ticket.channelId}>`
      ).join("\n\n")
    );
}

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

    const embed = createFeedbackEmbed(message.guild.id);

    if (!embed) {
      return message.reply("📭 कोई Feedback उपलब्ध नहीं है।");
    }

    return message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Channels permission चाहिए।",
        ephemeral: true
      });
    }

    const embed = createFeedbackEmbed(interaction.guild.id);

    if (!embed) {
      return interaction.reply({
        content: "📭 कोई Feedback उपलब्ध नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
