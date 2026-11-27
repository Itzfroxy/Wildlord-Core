const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketstats",
  aliases: ["tstats", "ticketstatistics"],

  data: new SlashCommandBuilder()
    .setName("ticketstats")
    .setDescription("Show ticket system statistics"),

  async execute(message) {
    const result = getStats(message.guild, message.member);

    if (typeof result === "string") {
      return message.reply(result);
    }

    return message.reply({ embeds: [result] });
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = getStats(interaction.guild, interaction.member);

    if (typeof result === "string") {
      return interaction.editReply(result);
    }

    return interaction.editReply({ embeds: [result] });
  }
};

function getStats(guild, member) {
  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff यह Stats देख सकता है।";
  }

  const tickets = getTicketData(guild.id).tickets;

  const total = tickets.length;
  const open = tickets.filter(t => t.status === "open").length;
  const closed = tickets.filter(t => t.status === "closed").length;
  const claimed = tickets.filter(t => t.status === "open" && t.claimedBy).length;
  const unclaimed = tickets.filter(t => t.status === "open" && !t.claimedBy).length;

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("📊 Ticket Statistics")
    .addFields(
      { name: "🎫 Total Tickets", value: `${total}`, inline: true },
      { name: "🟢 Open", value: `${open}`, inline: true },
      { name: "🔴 Closed", value: `${closed}`, inline: true },
      { name: "🛡️ Claimed", value: `${claimed}`, inline: true },
      { name: "📭 Unclaimed", value: `${unclaimed}`, inline: true }
    )
    .setTimestamp();

  return embed;
}
