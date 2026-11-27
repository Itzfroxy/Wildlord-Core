const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketadd",
  aliases: ["tadd", "addtoticket"],

  data: new SlashCommandBuilder()
    .setName("ticketadd")
    .setDescription("Add a member to the current ticket")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to add")
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

    const result = await addMember(
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

    const result = await addMember(
      interaction.channel,
      interaction.member,
      interaction.guild,
      member
    );

    return interaction.editReply(result);
  }
};

async function addMember(channel, actor, guild, member) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    return "❌ यह खुला Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    actor.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && actor.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff Member जोड़ सकता है।";
  }

  if (!member || member.user.bot) {
    return "❌ सही Non-Bot Member चुनो।";
  }

  await channel.permissionOverwrites.edit(member.id, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    AttachFiles: true
  });

  await channel.send(`➕ <@${member.id}> को Ticket में जोड़ा गया।`);

  return `✅ ${member.user.tag} को Ticket में जोड़ दिया गया।`;
}
