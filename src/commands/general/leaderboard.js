const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { readDatabase } = require("../../utils/database");

function createLeaderboard(guild) {
  const db = readDatabase();

  const users = Object.values(db.users)
    .filter(user => user.guildId === guild.id)
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 10);

  const description = users.length
    ? users.map((user, index) => {
        const member = guild.members.cache.get(user.userId);
        const name = member
          ? member.user.username
          : `Unknown User`;

        const medals = ["🥇", "🥈", "🥉"];
        const rank = medals[index] || `**${index + 1}.**`;

        return `${rank} **${name}** — Level ${user.level || 0} | ${user.xp || 0} XP`;
      }).join("\n")
    : "अभी Leaderboard खाली है।";

  return new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("🏆 Server XP Leaderboard")
    .setDescription(description)
    .setFooter({ text: "Wildlord Core • Top 10 Members" })
    .setTimestamp();
}

module.exports = {
  name: "leaderboard",
  aliases: ["lb", "top"],

  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the server XP leaderboard"),

  async execute(message) {
    const embed = createLeaderboard(message.guild);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const embed = createLeaderboard(interaction.guild);
    await interaction.reply({ embeds: [embed] });
  }
};
