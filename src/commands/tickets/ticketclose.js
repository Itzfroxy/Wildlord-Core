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
    await closeTicket(message.channel, message.member, message.guild, message);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await closeTicket(
      interaction.channel,
      interaction.member,
      interaction.guild,
      interaction
    );

    if (result) {
      return interaction.editReply("✅ Ticket बंद कर दिया गया।");
    }

    return interaction.editReply("❌ Ticket बंद नहीं हो सका।");
  }
};

async function closeTicket(channel, member, guild, source) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    if (source.reply) {
      return source.reply("❌ यह खुला Ticket नहीं है।");
    }
    return false;
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff && ticket.ownerId !== member.id) {
    if (source.reply) {
      return source.reply("❌ केवल Ticket Owner या Staff इसे बंद कर सकता है।");
    }
    return false;
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

  if (source.reply) {
    return source.reply("✅ Ticket बंद कर दिया गया।");
  }

  return true;
}
