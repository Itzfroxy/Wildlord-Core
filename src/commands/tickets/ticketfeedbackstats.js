
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

function createStatsEmbed(guildId) {
  const tickets = getTicketData(guildId).tickets;

  const feedbacks = tickets
    .map(ticket => ticket.feedback)
    .filter(feedback =>
      feedback &&
      Number.isInteger(Number(feedback.rating)) &&
      Number(feedback.rating) >= 1 &&
      Number(feedback.rating) <= 5
    );

  if (!feedbacks.length) return null;

  const total = feedbacks.length;

  const average = feedbacks.reduce(
    (sum, feedback) => sum + Number(feedback.rating),
    0
  ) / total;

  const counts = [1, 2, 3, 4, 5].map(rating =>
    feedbacks.filter(
      feedback => Number(feedback.rating) === rating
    ).length
  );

  return new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("⭐ Ticket Feedback Statistics")
    .addFields(
      { name: "Total Reviews", value: `${total}`, inline: true },
      { name: "Average Rating", value: `${average.toFixed(2)}/5 ⭐`, inline: true },
      { name: "⭐ 1 Star", value: `${counts[0]}`, inline: true },
      { name: "⭐⭐ 2 Stars", value: `${counts[1]}`, inline: true },
      { name: "⭐⭐⭐ 3 Stars", value: `${counts[2]}`, inline: true },
      { name: "⭐⭐⭐⭐ 4 Stars", value: `${counts[3]}`, inline: true },
      { name: "⭐⭐⭐⭐⭐ 5 Stars", value: `${counts[4]}`, inline: true }
    );
}

module.exports = {
  name: "ticketfeedbackstats",
  aliases: ["tfeedbackstats"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbackstats")
    .setDescription("View server ticket feedback statistics"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const embed = createStatsEmbed(message.guild.id);

    if (!embed) {
      return message.reply("📭 अभी कोई Ticket Feedback उपलब्ध नहीं है।");
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

    const embed = createStatsEmbed(interaction.guild.id);

    if (!embed) {
      return interaction.reply({
        content: "📭 अभी कोई Ticket Feedback उपलब्ध नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
