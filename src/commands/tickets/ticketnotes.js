
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicket } = require("../../utils/ticketManager");

function createNotesEmbed(ticket) {
  const notes = Array.isArray(ticket.notes)
    ? ticket.notes.filter(note => note && typeof note.text === "string")
    : [];

  if (!notes.length) return null;

  const recentNotes = notes.slice(-10);

  const description = recentNotes.map((note, i) => {
    const author = note.authorId ? `<@${note.authorId}>` : "Unknown Staff";
    const date = Number(note.createdAt);

    const timestamp = Number.isFinite(date) && date > 0
      ? `<t:${Math.floor(date / 1000)}:R>`
      : "Unknown date";

    const text = note.text.slice(0, 800);

    return `**${i + 1}.** ${text}\n${author} • ${timestamp}`;
  }).join("\n\n");

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("📋 Ticket Staff Notes")
    .setDescription(description.slice(0, 4000))
    .setFooter({ text: `Total Notes: ${notes.length}` });
}

module.exports = {
  name: "ticketnotes",
  aliases: ["tnotes"],

  data: new SlashCommandBuilder()
    .setName("ticketnotes")
    .setDescription("View staff notes for this ticket"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    const embed = createNotesEmbed(ticket);

    if (!embed) {
      return message.reply("📭 इस Ticket में अभी कोई Staff Note नहीं है।");
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

    const ticket = getTicket(interaction.guild.id, interaction.channel.id);

    if (!ticket) {
      return interaction.reply({
        content: "❌ यह Ticket Channel नहीं है।",
        ephemeral: true
      });
    }

    const embed = createNotesEmbed(ticket);

    if (!embed) {
      return interaction.reply({
        content: "📭 इस Ticket में अभी कोई Staff Note नहीं है।",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
