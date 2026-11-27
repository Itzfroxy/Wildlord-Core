
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getGuild, updateGuild } = require("../../utils/database");

function parseDuration(value) {
  const match = /^(\d+)(m|h|d)$/.exec(value || "");
  if (!match) return null;

  const amount = Number(match[1]);
  const units = { m: 60000, h: 3600000, d: 86400000 };
  const duration = amount * units[match[2]];

  if (!Number.isSafeInteger(duration) || duration <= 0 || duration > 7 * 86400000) {
    return null;
  }

  return duration;
}

async function tempBan(guild, moderator, userId, duration, reason) {
  const executor = await guild.members.fetch(moderator.id);

  if (!executor.permissions.has(PermissionFlagsBits.BanMembers)) {
    return "❌ तुम्हारे पास Ban Members Permission नहीं है।";
  }

  if (!/^\d{17,20}$/.test(userId || "")) {
    return "❌ सही Discord User ID डालो।";
  }

  const durationMs = parseDuration(duration);

  if (!durationMs) {
    return "❌ समय 1m से 7d तक होना चाहिए। उदाहरण: 30m, 2h, 3d";
  }

  const target = await guild.members.fetch(userId).catch(() => null);

  if (target) {
    if (target.id === moderator.id) {
      return "❌ तुम खुद को Ban नहीं कर सकते।";
    }

    if (
      guild.ownerId !== moderator.id &&
      executor.roles.highest.comparePositionTo(target.roles.highest) <= 0
    ) {
      return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Ban नहीं कर सकते।";
    }

    if (!target.bannable) {
      return "❌ Bot की Role इस Member से नीचे है।";
    }
  }

  try {
    await guild.members.ban(userId, { reason });

    const guildData = getGuild(guild.id);
    const tempBans = guildData.tempBans || [];

    tempBans.push({
      userId,
      moderatorId: moderator.id,
      reason,
      expiresAt: Date.now() + durationMs
    });

    updateGuild(guild.id, { tempBans });

    return `✅ User को ${duration} के लिए Ban कर दिया गया।`;
  } catch {
    return "❌ User को Ban नहीं किया जा सका।";
  }
}

module.exports = {
  name: "tempban",
  aliases: ["temporaryban"],

  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a user")
    .addStringOption(option =>
      option.setName("userid")
        .setDescription("Discord User ID")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("duration")
        .setDescription("Example: 30m, 2h, 3d (maximum 7d)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for ban")
        .setRequired(false)
        .setMaxLength(500)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    const userId = args[0]?.replace(/[<@!>]/g, "");
    const duration = args[1];
    const reason = args.slice(2).join(" ") || "No reason provided";

    return message.reply(
      await tempBan(message.guild, message.author, userId, duration, reason)
    );
  },

  async executeSlash(interaction) {
    const result = await tempBan(
      interaction.guild,
      interaction.user,
      interaction.options.getString("userid"),
      interaction.options.getString("duration"),
      interaction.options.getString("reason") || "No reason provided"
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
