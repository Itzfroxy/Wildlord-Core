
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicket } = require("../../utils/ticketManager");

function createFeedbackEmbed(ticket) {
  const feedback = ticket.feedback;

  if (
    !feedback ||
    !Number.isInteger(Number(feedback.rating)) ||
    Number(feedback.rating) < 1 ||
    Number(feedback.rating) > 5
  ) {
    return null;
  }

  const embed = new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("⭐ Ticket Feedback")
    .addFields(
      { name: "Rating", value: `${feedback.rating}/5 ⭐`, inline: true },
      { name: "User", value: feedback.userId ? `<@${feedback.userId}>` : "Unknown", inline: true },
      { name: "Comment", value: feedback.comment || "कोई Comment नहीं" }
    );

  if (feedback.createdAt) {
    embed.setTimestamp(new Date(feedback.createdAt));
  }

  return embed;
}

module.exports = {
  name: "ticketfeedbacks",
  aliases: ["tfeedbacks"],

  data: new SlashCommandBuilder()
    .setName("ticketfeedbacks")
    .setDescription("View ticket feedback"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    const embed = createFeedbackEmbed(ticket);

    if (!embed) {
      return message.reply("📭 इस Ticket में Feedback उपलब्ध नहीं है।");
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

    const embed = createFeedbackEmbed(ticket);

    if (!embed) {
      return interaction.reply({
        content: "📭 इस Ticket में Feedback उपलब्ध नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
