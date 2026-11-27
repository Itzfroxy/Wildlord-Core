const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketpanel",
  aliases: ["tickets", "supportpanel"],

  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Send the configured ticket panel"),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ तुम्हें Manage Server permission चाहिए।");
    }

    const config = getTicketData(message.guild.id);

    if (!config.enabled) {
      return message.reply("❌ पहले Ticket System setup करो।");
    }

    const targetChannel = config.panelChannelId
      ? message.guild.channels.cache.get(config.panelChannelId)
      : message.channel;

    if (!targetChannel || !targetChannel.isTextBased()) {
      return message.reply("❌ Ticket Panel Channel नहीं मिला।");
    }

    const embed = new EmbedBuilder()
      .setColor(config.panelColor || "#5865F2")
      .setTitle(config.panelTitle || "Support Tickets")
      .setDescription(
        config.panelDescription ||
        "Support के लिए नीचे दिए गए बटन से Ticket खोलें।"
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

    await targetChannel.send({
      embeds: [embed],
      components: [row]
    });

    return message.reply(
      `✅ Ticket Panel ${targetChannel} में भेज दिया गया।`
    );
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Server permission चाहिए।",
        ephemeral: true
      });
    }

    const config = getTicketData(interaction.guild.id);

    if (!config.enabled) {
      return interaction.reply({
        content: "❌ पहले Ticket System setup करो।",
        ephemeral: true
      });
    }

    const targetChannel = config.panelChannelId
      ? interaction.guild.channels.cache.get(config.panelChannelId)
      : interaction.channel;

    if (!targetChannel || !targetChannel.isTextBased()) {
      return interaction.reply({
        content: "❌ Ticket Panel Channel नहीं मिला।",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.panelColor || "#5865F2")
      .setTitle(config.panelTitle || "Support Tickets")
      .setDescription(
        config.panelDescription ||
        "Support के लिए नीचे दिए गए बटन से Ticket खोलें।"
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

    await targetChannel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: `✅ Ticket Panel ${targetChannel} में भेज दिया गया।`,
      ephemeral: true
    });
  }
};
