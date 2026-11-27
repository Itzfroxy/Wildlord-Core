const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  getTicket,
  getTicketData,
  removeTicket
} = require("../../utils/ticketManager");

module.exports = {
  name: "ticketdelete",
  aliases: ["tdelete", "deleteticket"],

  data: new SlashCommandBuilder()
    .setName("ticketdelete")
    .setDescription("Delete the current ticket"),

  async execute(message) {
    const result = await deleteTicket(
      message.channel,
      message.member,
      message.guild
    );

    if (result !== true) {
      return message.reply(result);
    }
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = await deleteTicket(
      interaction.channel,
      interaction.member,
      interaction.guild
    );

    if (result !== true) {
      return interaction.editReply(result);
    }

    return interaction.editReply("🗑️ Ticket Delete किया जा रहा है।");
  }
};

async function deleteTicket(channel, member, guild) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket) {
    return "❌ यह Ticket Channel नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff इसे Delete कर सकता है।";
  }

  removeTicket(guild.id, channel.id);

  await channel.delete("Ticket deleted by staff").catch(() => null);

  return true;
}
