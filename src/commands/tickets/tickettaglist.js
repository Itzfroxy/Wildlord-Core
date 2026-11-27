const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "tickettaglist",
  aliases: ["ttaglist"],

  data: new SlashCommandBuilder()
    .setName("tickettaglist")
    .setDescription("View tags assigned to this ticket"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    const tags = ticket.tags || [];

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🏷️ Ticket Tags")
      .setDescription(
        tags.length
          ? tags.map((tag, i) => `**${i + 1}.** ${tag}`).join("\n")
          : "इस Ticket में अभी कोई Tag नहीं है।"
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

    const tags = ticket.tags || [];

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🏷️ Ticket Tags")
      .setDescription(
        tags.length
          ? tags.map((tag, i) => `**${i + 1}.** ${tag}`).join("\n")
          : "इस Ticket में अभी कोई Tag नहीं है।"
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
