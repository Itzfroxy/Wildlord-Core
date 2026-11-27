const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  getTicket,
  getTicketData,
  saveTicket
} = require("../../utils/ticketManager");

module.exports = {
  name: "ticketclose",
  aliases: ["tclose", "close"],

  data: new SlashCommandBuilder()
    .setName("ticketclose")
    .setDescription("Close the current ticket"),

  async execute(message) {
    const result = await closeTicket(
      message.channel,
      message.member,
      message.guild
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await closeTicket(
      interaction.channel,
      interaction.member,
      interaction.guild
    );

    return interaction.editReply(result);
  }
};

async function closeTicket(channel, member, guild) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    return "❌ यह खुला Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff && ticket.ownerId !== member.id) {
    return "❌ केवल Ticket Owner या Staff इसे बंद कर सकता है।";
  }

  saveTicket(guild.id, {
    ...ticket,
    status: "closed",
    closedAt: new Date().toISOString()
  });

  await channel.permissionOverwrites.edit(ticket.ownerId, {
    SendMessages: false
  }).catch(() => null);

  await channel.send("🔒 Ticket बंद कर दिया गया है।");

  return "✅ Ticket बंद कर दिया गया।";
}
