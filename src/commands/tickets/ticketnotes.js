const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicket } = require("../../utils/ticketManager");

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

    const notes = ticket.notes || [];

    if (!notes.length) {
      return message.reply("📭 इस Ticket में अभी कोई Staff Note नहीं है।");
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📋 Ticket Staff Notes")
      .setDescription(
        notes.slice(-10).map((note, i) =>
          `**${i + 1}.** ${note.text}\n` +
          `<@${note.authorId}> • <t:${Math.floor(note.createdAt / 1000)}:R>`
        ).join("\n\n")
      )
      .setFooter({ text: `Total Notes: ${notes.length}` });

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

    const notes = ticket.notes || [];

    if (!notes.length) {
      return interaction.reply({
        content: "📭 इस Ticket में अभी कोई Staff Note नहीं है।",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📋 Ticket Staff Notes")
      .setDescription(
        notes.slice(-10).map((note, i) =>
          `**${i + 1}.** ${note.text}\n` +
          `<@${note.authorId}> • <t:${Math.floor(note.createdAt / 1000)}:R>`
        ).join("\n\n")
      )
      .setFooter({ text: `Total Notes: ${notes.length}` });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
