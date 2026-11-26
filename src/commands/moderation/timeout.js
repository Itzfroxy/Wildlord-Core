const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

function parseDuration(input) {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;

  const amount = Number(match[1]);
  const units = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };

  const duration = amount * units[match[2].toLowerCase()];

  if (duration < 1000 || duration > 28 * 86400000) {
    return null;
  }

  return duration;
}

async function timeoutMember(guild, target, moderator, duration, reason) {
  const executor = await guild.members.fetch(moderator.id);
  const member = await guild.members.fetch(target.id).catch(() => null);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  if (!member) return "❌ Member Server में नहीं मिला।";
  if (member.id === moderator.id) return "❌ खुद को Timeout नहीं कर सकते।";
  if (member.id === guild.ownerId) return "❌ Server Owner को Timeout नहीं कर सकते।";

  if (
    guild.ownerId !== moderator.id &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0
  ) {
    return "❌ तुम अपनी बराबर या ऊपर की Role वाले Member को Timeout नहीं कर सकते।";
  }

  if (!member.moderatable) {
    return "❌ Bot इस Member को Timeout नहीं कर सकता।";
  }

  try {
    await member.timeout(duration, reason);

    return new EmbedBuilder()
      .setColor("#E67E22")
      .setTitle("⏳ Member Timed Out")
      .addFields(
        { name: "Member", value: target.tag, inline: true },
        { name: "Moderator", value: moderator.tag, inline: true },
        { name: "Duration", value: `${duration / 1000} seconds`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

  } catch (error) {
    console.error("Timeout error:", error);
    return "❌ Timeout करते समय Error आया।";
  }
}

module.exports = {
  name: "timeout",
  aliases: ["mute", "silence"],

  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a server member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to timeout")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("duration")
        .setDescription("Example: 10m, 1h, 1d")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Reason for timeout")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,timeout @user 10m [reason]`");
    }

    const duration = parseDuration(args[1] || "");

    if (!duration) {
      return message.reply("❌ सही Duration डालो: `10m`, `1h`, `1d`");
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    const result = await timeoutMember(
      message.guild, target, message.author, duration, reason
    );

    await message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const duration = parseDuration(
      interaction.options.getString("duration")
    );

    if (!duration) {
      return interaction.reply({
        content: "❌ Duration: 10m, 1h या 1d डालो।",
        ephemeral: true
      });
    }

    const reason = interaction.options.getString("reason") || "No reason provided";

    const result = await timeoutMember(
      interaction.guild, target, interaction.user, duration, reason
    );

    await interaction.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  }
};
