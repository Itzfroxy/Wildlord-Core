
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

async function createBanList(guild) {
  const bans = await guild.bans.fetch();

  const embed = new EmbedBuilder()
    .setColor("#E74C3C")
    .setTitle("🔨 Server Ban List")
    .setDescription(`Total Banned Users: **${bans.size}**`)
    .setTimestamp();

  if (bans.size === 0) {
    embed.setDescription("इस Server में कोई Banned User नहीं है।");
    return embed;
  }

  const entries = [...bans.values()].slice(0, 15);

  embed.addFields({
    name: "Banned Members",
    value: entries.map((ban, index) =>
      `**${index + 1}.** ${ban.user.tag}\n` +
      `ID: \`${ban.user.id}\`\n` +
      `Reason: ${ban.reason || "No reason"}`
    ).join("\n\n")
  });

  if (bans.size > 15) {
    embed.setFooter({
      text: `Showing 15 of ${bans.size} banned users`
    });
  }

  return embed;
}

module.exports = {
  name: "banlist",
  aliases: ["bans", "bannedlist"],

  data: new SlashCommandBuilder()
    .setName("banlist")
    .setDescription("View all banned users in this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ तुम्हारे पास Ban Members Permission नहीं है।");
    }

    try {
      const embed = await createBanList(message.guild);
      return message.reply({ embeds: [embed] });
    } catch {
      return message.reply("❌ Ban List लोड नहीं हो सकी।");
    }
  },

  async executeSlash(interaction) {
    try {
      const embed = await createBanList(interaction.guild);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    } catch {
      return interaction.reply({
        content: "❌ Ban List लोड नहीं हो सकी।",
        ephemeral: true
      });
    }
  }
};
        
