const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketremove",
  aliases: ["tremove", "removefromticket"],

  data: new SlashCommandBuilder()
    .setName("ticketremove")
    .setDescription("Remove a member from the current ticket")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to remove")
        .setRequired(true)
    ),

  async execute(message, args) {
    const userId = args[0]?.replace(/[<@!>]/g, "");
    const member = userId
      ? await message.guild.members.fetch(userId).catch(() => null)
      : null;

    if (!member) {
      return message.reply("❌ सही Member ID या Mention डालो।");
    }

    const result = await removeMember(
      message.channel,
      message.member,
      message.guild,
      member
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.options.getMember("user");

    const result = await removeMember(
      interaction.channel,
      interaction.member,
      interaction.guild,
      member
    );

    return interaction.editReply(result);
  }
};

async function removeMember(channel, actor, guild, member) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    return "❌ यह खुला Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    actor.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && actor.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff Member निकाल सकता है।";
  }

  if (!member) {
    return "❌ Member नहीं मिला।";
  }

  if (member.id === ticket.ownerId) {
    return "❌ Ticket Owner को Ticket से नहीं निकाल सकते।";
  }

  const overwrite = channel.permissionOverwrites.cache.get(member.id);

  if (!overwrite) {
    return "❌ इस Member को Ticket में अलग से Access नहीं दिया गया है।";
  }

  await channel.permissionOverwrites.delete(member.id);

  await channel.send(`➖ <@${member.id}> को Ticket से निकाल दिया गया।`);

  return `✅ ${member.user.tag} को Ticket से निकाल दिया गया।`;
}
