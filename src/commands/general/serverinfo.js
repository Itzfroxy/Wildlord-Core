const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

async function createServerEmbed(guild) {
  await guild.fetch();

  const owner = await guild.fetchOwner();
  const members = await guild.members.fetch();

  const textChannels = guild.channels.cache.filter(
    channel => channel.type === 0
  ).size;

  const voiceChannels = guild.channels.cache.filter(
    channel => channel.type === 2
  ).size;

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`🌐 ${guild.name} Server Info`)
    .setThumbnail(guild.iconURL({ size: 1024 }))
    .addFields(
      { name: "👑 Owner", value: `${owner.user.tag}`, inline: true },
      { name: "👥 Members", value: `${members.size}`, inline: true },
      { name: "📝 Text Channels", value: `${textChannels}`, inline: true },
      { name: "🔊 Voice Channels", value: `${voiceChannels}`, inline: true },
      { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true },
      { name: "😀 Emojis", value: `${guild.emojis.cache.size}`, inline: true },
      { name: "🆔 Server ID", value: guild.id, inline: false },
      {
        name: "📅 Created",
        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
        inline: false
      }
    )
    .setFooter({ text: "Wildlord Core • Server Information" })
    .setTimestamp();
}

module.exports = {
  name: "serverinfo",
  aliases: ["server", "guildinfo"],

  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show server information"),

  async execute(message) {
    await message.reply({
      embeds: [await createServerEmbed(message.guild)]
    });
  },

  async executeSlash(interaction) {
    await interaction.reply({
      embeds: [await createServerEmbed(interaction.guild)]
    });
  }
};
