const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketlist",
  aliases: ["tlist", "opentickets"],

  data: new SlashCommandBuilder()
    .setName("ticketlist")
    .setDescription("List open tickets"),

  async execute(message) {
    const result = getList(message.guild, message.member);

    if (typeof result === "string") {
      return message.reply(result);
    }

    return message.reply({ embeds: [result] });
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = getList(interaction.guild, interaction.member);

    if (typeof result === "string") {
      return interaction.editReply(result);
    }

    return interaction.editReply({ embeds: [result] });
  }
};

function getList(guild, member) {
  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff यह सूची देख सकता है।";
  }

  const tickets = getTicketData(guild.id).tickets.filter(
    ticket => ticket.status === "open"
  );

  if (!tickets.length) {
    return "📭 अभी कोई Open Ticket नहीं है।";
  }

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🎫 Open Tickets")
    .setDescription(
      tickets.slice(0, 25).map((ticket, i) =>
        `**${i + 1}.** <#${ticket.channelId}>\n` +
        `👤 Owner: <@${ticket.ownerId}>\n` +
        `🛡️ Claimed: ${ticket.claimedBy ? `<@${ticket.claimedBy}>` : "Unclaimed"}`
      ).join("\n\n")
    )
    .setFooter({ text: `Total Open Tickets: ${tickets.length}` })
    .setTimestamp();

  return embed;
}
