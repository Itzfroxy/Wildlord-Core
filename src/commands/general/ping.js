const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function createPingEmbed(client) {
  const latency = Date.now() - client.readyTimestamp;
  const apiLatency = Math.round(client.ws.ping);

  return new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle("🏓 Wildlord Core Ping")
    .addFields(
      {
        name: "🤖 Bot Uptime",
        value: `${Math.floor(client.uptime / 1000)} seconds`,
        inline: true
      },
      {
        name: "📡 API Latency",
        value: `${apiLatency} ms`,
        inline: true
      },
      {
        name: "⚡ Response Time",
        value: `${latency} ms`,
        inline: true
      }
    )
    .setTimestamp();
}

module.exports = {
  name: "ping",
  aliases: ["latency"],

  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  async execute(message, args, client) {
    await message.reply({
      embeds: [createPingEmbed(client)]
    });
  },

  async executeSlash(interaction, client) {
    await interaction.reply({
      embeds: [createPingEmbed(client)]
    });
  }
};
