
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

async function sendTicketPanel(guild, channel, moderator) {
  if (!moderator.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return "❌ तुम्हारे पास Manage Server Permission नहीं है।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const embed = new EmbedBuilder()
    .setColor(config.panelColor || "#5865F2")
    .setTitle(config.panelTitle || "🎫 Support Tickets")
    .setDescription(
      config.panelDescription ||
      "Click the button below to open a support ticket."
    );

  if (config.panelFooter) {
    embed.setFooter({ text: config.panelFooter });
  }

  if (config.panelImage) {
    embed.setImage(config.panelImage);
  }

  if (config.panelThumbnail) {
    embed.setThumbnail(config.panelThumbnail);
  }

  const button = new ButtonBuilder()
    .setCustomId("ticket:create")
    .setLabel(config.buttonLabel || "Create Ticket")
    .setStyle(ButtonStyle.Primary);

  if (config.buttonEmoji) {
    button.setEmoji(config.buttonEmoji);
  }

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    embeds: [embed],
    components: [row]
  });

  return "✅ Ticket Panel सफलतापूर्वक भेज दिया गया!";
}

module.exports = {
  name: "ticketpanel",
  aliases: ["tickets", "supportpanel"],

  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Send the support ticket panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(message) {
    const result = await sendTicketPanel(
      message.guild,
      message.channel,
      message.member
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const result = await sendTicketPanel(
      interaction.guild,
      interaction.channel,
      interaction.member
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
