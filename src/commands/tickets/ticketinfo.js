const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const { getTicket } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketinfo",
  aliases: ["tinfo", "ticketdetails"],

  data: new SlashCommandBuilder()
    .setName("ticketinfo")
    .setDescription("Show current ticket information"),

  async execute(message) {
    return sendTicketInfo(message.channel, message.guild, message);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await sendTicketInfo(
      interaction.channel,
      interaction.guild
    );

    if (!result) {
      return interaction.editReply("❌ यह Ticket Channel नहीं है।");
    }

    return interaction.editReply({ embeds: [result] });
  }
};

async function sendTicketInfo(channel, guild, message = null) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket) {
    if (message) {
      return message.reply("❌ यह Ticket Channel नहीं है।");
    }
    return null;
  }

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🎫 Ticket Information")
    .addFields(
      { name: "Owner", value: `<@${ticket.ownerId}>`, inline: true },
      { name: "Status", value: ticket.status || "Unknown", inline: true },
      { name: "Claimed By", value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : "Unclaimed", inline: true },
      { name: "Channel", value: `<#${ticket.channelId}>`, inline: true },
      { name: "Created", value: ticket.createdAt ? `<t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:F>` : "Unknown", inline: true },
      { name: "Ticket ID", value: ticket.channelId }
    )
    .setTimestamp();

  if (message) {
    return message.reply({ embeds: [embed] });
  }

  return embed;
}
