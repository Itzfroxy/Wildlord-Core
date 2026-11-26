
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

module.exports = {
  name: "modlogtest",
  aliases: ["testmodlog", "modlogcheck"],

  data: new SlashCommandBuilder()
    .setName("modlogtest")
    .setDescription("Test the moderation logs channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ तुम्हें Administrator Permission चाहिए।");
    }

    const guildData = getGuild(message.guild.id);
    const channelId = guildData.modLogChannelId;

    if (!channelId) {
      return message.reply("❌ पहले Mod Logs Channel सेट करो।");
    }

    const channel = await message.guild.channels.fetch(channelId).catch(() => null);

    if (!channel || !channel.isTextBased() || !channel.isSendable()) {
      return message.reply("❌ सेट किया गया चैनल उपलब्ध नहीं है या उसमें मैसेज नहीं भेज सकते।");
    }

    const embed = new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("✅ Moderation Log Test")
      .setDescription("Wildlord Core इस चैनल में Moderation Logs भेज सकता है।")
      .addFields(
        { name: "Tested By", value: `${message.author.tag}`, inline: true },
        { name: "Server", value: message.guild.name, inline: true }
      )
      .setTimestamp();

    try {
      await channel.send({ embeds: [embed] });
      return message.reply("✅ Test Log सफलतापूर्वक भेज दिया गया।");
    } catch {
      return message.reply("❌ Bot को इस चैनल में मैसेज भेजने की Permission नहीं है।");
    }
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ तुम्हें Administrator Permission चाहिए।",
        ephemeral: true
      });
    }

    const guildData = getGuild(interaction.guild.id);
    const channelId = guildData.modLogChannelId;

    if (!channelId) {
      return interaction.reply({
        content: "❌ पहले Mod Logs Channel सेट करो।",
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel || !channel.isTextBased() || !channel.isSendable()) {
      return interaction.reply({
        content: "❌ सेट किया गया चैनल उपलब्ध नहीं है या उसमें मैसेज नहीं भेज सकते।",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("✅ Moderation Log Test")
      .setDescription("Wildlord Core इस चैनल में Moderation Logs भेज सकता है।")
      .addFields(
        { name: "Tested By", value: `${interaction.user.tag}`, inline: true },
        { name: "Server", value: interaction.guild.name, inline: true }
      )
      .setTimestamp();

    try {
      await channel.send({ embeds: [embed] });
      return interaction.reply({
        content: "✅ Test Log सफलतापूर्वक भेज दिया गया।",
        ephemeral: true
      });
    } catch {
      return interaction.reply({
        content: "❌ Bot को इस चैनल में मैसेज भेजने की Permission नहीं है।",
        ephemeral: true
      });
    }
  }
};
