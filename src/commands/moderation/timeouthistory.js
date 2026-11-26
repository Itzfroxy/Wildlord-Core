
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getGuild } = require("../../utils/database");

function createTimeoutHistory(guildId, userId) {
  const guildData = getGuild(guildId);

  const history = (guildData.modLogs || [])
    .filter(log =>
      log.targetId === userId &&
      log.action === "TIMEOUT"
    )
    .slice(-10)
    .reverse();

  const embed = new EmbedBuilder()
    .setColor("#E67E22")
    .setTitle("⏳ Timeout History")
    .setDescription(`User ID: \`${userId}\``)
    .setTimestamp();

  if (!history.length) {
    embed.setDescription("इस User की कोई Timeout History नहीं मिली।");
    return embed;
  }

  history.forEach((log, index) => {
    embed.addFields({
      name: `Timeout ${index + 1}`,
      value:
        `**Moderator:** <@${log.moderatorId}>\n` +
        `**Reason:** ${log.reason || "No reason"}\n` +
        `**Date:** <t:${Math.floor(new Date(log.date).getTime() / 1000)}:R>`
    });
  });

  return embed;
}

module.exports = {
  name: "timeouthistory",
  aliases: ["thistory", "timeoutrecords"],

  data: new SlashCommandBuilder()
    .setName("timeouthistory")
    .setDescription("View a member's timeout history")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to check")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,timeouthistory @user`");
    }

    return message.author.send({
      embeds: [createTimeoutHistory(message.guild.id, target.id)]
    }).then(() => {
      message.reply("✅ Timeout History तुम्हारे DM में भेज दी गई।");
    }).catch(() => {
      message.reply("❌ तुम्हारे DM बंद हैं।");
    });
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");

    return interaction.reply({
      embeds: [createTimeoutHistory(interaction.guild.id, target.id)],
      ephemeral: true
    });
  }
};
