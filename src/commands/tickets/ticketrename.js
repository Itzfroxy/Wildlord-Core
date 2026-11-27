const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicket, getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketrename",
  aliases: ["trename", "renameticket"],

  data: new SlashCommandBuilder()
    .setName("ticketrename")
    .setDescription("Rename the current ticket")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("New ticket channel name")
        .setRequired(true)
        .setMaxLength(90)
    ),

  async execute(message, args) {
    const name = args.join(" ").trim();

    if (!name) {
      return message.reply("❌ नया Ticket नाम लिखो।");
    }

    const result = await renameTicket(
      message.channel,
      message.member,
      message.guild,
      name
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.options.getString("name");

    const result = await renameTicket(
      interaction.channel,
      interaction.member,
      interaction.guild,
      name
    );

    return interaction.editReply(result);
  }
};

async function renameTicket(channel, member, guild, name) {
  const ticket = getTicket(guild.id, channel.id);

  if (!ticket || ticket.status !== "open") {
    return "❌ यह खुला Ticket नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const isStaff =
    member.permissions.has(PermissionFlagsBits.ManageChannels) ||
    (config.staffRoleId && member.roles.cache.has(config.staffRoleId));

  if (!isStaff) {
    return "❌ केवल Ticket Staff नाम बदल सकता है।";
  }

  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

  if (!safeName) {
    return "❌ यह नाम सही नहीं है। English अक्षर, नंबर या hyphen इस्तेमाल करो।";
  }

  await channel.setName(safeName);

  return `✅ Ticket का नाम बदलकर **${safeName}** कर दिया गया।`;
}
