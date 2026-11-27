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
  name: "ticketreopen",
  aliases: ["treopen", "reopen"],

  data: new SlashCommandBuilder()
    .setName("ticketreopen")
    .setDescription("Reopen a closed ticket"),

  async execute(message) {
    const result = await reopenTicket(
      message.channel,
      message.member,
      message.guild
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await reopenTicket(
      interaction.channel,
      interaction.member,
      interaction.guild
    );

    return interaction.editReply(result);
  }
};

async function reopenTicket(channel, member, guild) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "closed") {
    return "❌ यह बंद Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff इसे दोबारा खोल सकता है।";
  }

  saveTicket(guild.id, {
    ...ticket,
    status: "open",
    reopenedAt: new Date().toISOString()
  });

  await channel.permissionOverwrites.edit(ticket.ownerId, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    AttachFiles: true
  }).catch(() => null);

  await channel.send("🔓 Ticket दोबारा खोल दिया गया है!");

  return "✅ Ticket दोबारा खोल दिया गया है।";
}
