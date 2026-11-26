const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUser } = require("../../utils/database");
const { calculateLevel } = require("../../utils/leveling");

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

function createStatsEmbed(user, guildId) {
  const data = getUser(guildId, user.id);
  const levelData = calculateLevel(data.xp || 0);

  const progress = Math.floor(
    (levelData.currentXP / levelData.requiredXP) * 10
  );

  const bar =
    "🟩".repeat(progress) +
    "⬛".repeat(10 - progress);

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`📊 ${user.username}'s Stats`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: "⭐ Level", value: `${levelData.level}`, inline: true },
      { name: "✨ Total XP", value: `${data.xp || 0}`, inline: true },
      { name: "💬 Messages", value: `${data.messages || 0}`, inline: true },
      { name: "🎙️ Voice Time", value: formatTime(data.voiceSeconds || 0), inline: true },
      {
        name: "📈 XP Progress",
        value: `${bar}\n${levelData.currentXP}/${levelData.requiredXP} XP`,
        inline: false
      }
    )
    .setFooter({ text: "Wildlord Core Statistics" })
    .setTimestamp();
}

module.exports = {
  name: "stats",
  aliases: ["profile", "mystats"],

  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View member statistics")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Member whose stats you want to see")
        .setRequired(false)
    ),

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const embed = createStatsEmbed(user, message.guild.id);

    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const embed = createStatsEmbed(user, interaction.guild.id);

    await interaction.reply({ embeds: [embed] });
  }
};
