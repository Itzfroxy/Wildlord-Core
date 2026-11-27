
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

function createFeedbackListEmbed(guildId) {
  const tickets = getTicketData(guildId).tickets;

  const feedbacks = tickets
    .filter(ticket =>
      ticket.feedback &&
      Number(ticket.feedback.rating) >= 1 &&
      Number(ticket.feedback.rating) <= 5
    )
    .sort((a, b) =>
      Number(b.feedback.createdAt || 0) -
      Number(a.feedback.createdAt || 0)
    )
    .slice(0, 10);

  if (!feedbacks.length) return null;

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("📋 Recent Ticket Feedback")
    .setDescription(
      feedbacks.map((ticket, index) => {
        const feedback = ticket.feedback;
        const date = feedback.createdAt
          ? `<t:${Math.floor(feedback.createdAt / 1000)}:R>`
          : "Unknown";

        return (
          `**${index + 1}.** <@${feedback.userId || "0"}> — ` +
          `${feedback.rating}/5 ⭐\n` +
          `Ticket: <#${ticket.channelId}>\n` +
          `Date: ${date}`
        );
      }).join("\n\n")
    );

  return embed;
}

module.exports = {
  name: "ticketfeedbacklist",
  aliases: ["tfeedbacklist"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbacklist")
    .setDescription("List recent ticket feedback"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const embed = createFeedbackListEmbed(message.guild.id);

    if (!embed) {
      return message.reply("📭 कोई Ticket Feedback उपलब्ध नहीं है।");
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

    const embed = createFeedbackListEmbed(interaction.guild.id);

    if (!embed) {
      return interaction.reply({
        content: "📭 कोई Ticket Feedback उपलब्ध नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
