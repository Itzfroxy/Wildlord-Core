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
  name: "ticketclaim",
  aliases: ["tclaim", "claimticket"],

  data: new SlashCommandBuilder()
    .setName("ticketclaim")
    .setDescription("Claim the current ticket"),

  async execute(message) {
    const result = await claimTicket(
      message.channel,
      message.member,
      message.guild
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await claimTicket(
      interaction.channel,
      interaction.member,
      interaction.guild
    );

    return interaction.editReply(result);
  }
};

async function claimTicket(channel, member, guild) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    return "❌ यह खुला Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff इसे Claim कर सकता है।";
  }

  if (ticket.claimedBy) {
    return `⚠️ यह Ticket पहले ही <@${ticket.claimedBy}> Claim कर चुका है।`;
  }

  saveTicket(guild.id, {
    ...ticket,
    claimedBy: member.id,
    claimedAt: new Date().toISOString()
  });

  await channel.send(`🛡️ यह Ticket <@${member.id}> ने Claim कर लिया है।`);

  return "✅ Ticket सफलतापूर्वक Claim हो गया।";
}
