const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, saveTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "tickettags",
  aliases: ["ttags", "ticketlabel"],

  data: new SlashCommandBuilder()
    .setName("tickettags")
    .setDescription("Add or update ticket tags")
    .addStringOption(option =>
      option.setName("tags")
        .setDescription("Tags separated by commas")
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

    const tags = args.join(" ")
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (!tags.length) {
      return message.reply("❌ कम से कम एक Tag डालो।");
    }

    ticket.tags = tags;

    saveTicket(message.guild.id, ticket);

    return message.reply(
      `🏷️ Ticket Tags अपडेट हो गए:\n${tags.map(tag => `• ${tag}`).join("\n")}`
    );
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

    const tags = interaction.options.getString("tags")
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (!tags.length) {
      return interaction.reply({
        content: "❌ कम से कम एक Tag डालो।",
        ephemeral: true
      });
    }

    ticket.tags = tags;

    saveTicket(interaction.guild.id, ticket);

    return interaction.reply({
      content: `🏷️ Ticket Tags अपडेट हो गए:\n${tags.map(tag => `• ${tag}`).join("\n")}`,
      ephemeral: true
    });
  }
};
