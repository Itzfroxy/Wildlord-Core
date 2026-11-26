const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function createBotEmbed(client) {
  const uptime = Math.floor(client.uptime / 1000);

  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🤖 Wildlord Core — Bot Info")
    .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
    .addFields(
      { name: "🏷️ Bot Name", value: client.user.tag, inline: true },
      { name: "🆔 Bot ID", value: client.user.id, inline: true },
      { name: "🌐 Servers", value: `${client.guilds.cache.size}`, inline: true },
      { name: "👥 Cached Users", value: `${client.users.cache.size}`, inline: true },
      { name: "📡 API Ping", value: `${Math.round(client.ws.ping)} ms`, inline: true },
      { name: "⏱️ Uptime", value: `${days}d ${hours}h ${minutes}m`, inline: true },
      { name: "📦 Discord.js", value: `v${require("discord.js").version}`, inline: true },
      { name: "⚙️ Node.js", value: process.version, inline: true }
    )
    .setFooter({ text: "Wildlord Core • Bot Information" })
    .setTimestamp();
}

module.exports = {
  name: "botinfo",
  aliases: ["about", "bot"],

  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Show bot information"),

  async execute(message, args, client) {
    await message.reply({
      embeds: [createBotEmbed(client)]
    });
  },

  async executeSlash(interaction, client) {
    await interaction.reply({
      embeds: [createBotEmbed(client)]
    });
  }
};
