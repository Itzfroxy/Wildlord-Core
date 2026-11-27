const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "tickettagremove",
  aliases: ["ttagremove"],

  data: new SlashCommandBuilder()
    .setName("tickettagremove")
    .setDescription("Remove a tag from this ticket")
    .addStringOption(option =>
      option.setName("tag")
        .setDescription("Tag to remove")
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ तुम्हें Manage Channels permission चाहिए।");
    }

    const ticket = getTicket(message.guild.id, message.channel.id);

    if (!ticket) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }

    if (!Array.isArray(ticket.tags) || !ticket.tags.length) {
      return message.reply("❌ इस Ticket में कोई Tags नहीं हैं।");
    }

    const tag = args.join(" ").trim();
    const index = ticket.tags.findIndex(
      item => item.toLowerCase() === tag.toLowerCase()
    );

    if (index === -1) {
      return message.reply("❌ यह Tag नहीं मिला।");
    }

    const removed = ticket.tags.splice(index, 1)[0];

    saveTicket(message.guild.id, ticket);

    return message.reply(`✅ Tag **${removed}** हटा दिया गया।`);
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

    if (!Array.isArray(ticket.tags) || !ticket.tags.length) {
      return interaction.reply({
        content: "❌ इस Ticket में कोई Tags नहीं हैं।",
        ephemeral: true
      });
    }

    const tag = interaction.options.getString("tag").trim();
    const index = ticket.tags.findIndex(
      item => item.toLowerCase() === tag.toLowerCase()
    );

    if (index === -1) {
      return interaction.reply({
        content: "❌ यह Tag नहीं मिला।",
        ephemeral: true
      });
    }

    const removed = ticket.tags.splice(index, 1)[0];

    saveTicket(interaction.guild.id, ticket);

    return interaction.reply({
      content: `✅ Tag **${removed}** हटा दिया गया।`,
      ephemeral: true
    });
  }
};
