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
  name: "ticketunclaim",
  aliases: ["tunclaim", "unclaimticket"],

  data: new SlashCommandBuilder()
    .setName("ticketunclaim")
    .setDescription("Unclaim the current ticket"),

  async execute(message) {
    const result = await unclaimTicket(
      message.channel,
      message.member,
      message.guild
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await unclaimTicket(
      interaction.channel,
      interaction.member,
      interaction.guild
    );

    return interaction.editReply(result);
  }
};

async function unclaimTicket(channel, member, guild) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    return "❌ यह खुला Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff इसे Unclaim कर सकता है।";
  }

  if (!ticket.claimedBy) {
    return "❌ यह Ticket अभी Claim नहीं हुआ है।";
  }

  if (ticket.claimedBy !== member.id &&
      !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return "❌ केवल Claim करने वाला Staff या Manage Channels वाला इसे Unclaim कर सकता है।";
  }

  saveTicket(guild.id, {
    ...ticket,
    claimedBy: null,
    claimedAt: null,
    unclaimedAt: new Date().toISOString()
  });

  await channel.send(`↩️ <@${member.id}> ने Ticket Unclaim कर दिया है।`);

  return "✅ Ticket Unclaim हो गया।";
}
