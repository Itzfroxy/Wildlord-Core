
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");
const { sendModLog } = require("../../utils/modLogger");

async function removeWarning(guild, target, moderator, number) {
  const executor = await guild.members.fetch(moderator.id);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  const userData = getUser(guild.id, target.id);
  const warnings = Array.isArray(userData.warnings)
    ? userData.warnings
    : [];

  if (!Number.isInteger(number) || number < 1 || number > warnings.length) {
    return `❌ गलत Warning Number! इस Member के पास ${warnings.length} Warnings हैं।`;
  }

  const index = warnings.length - number;
  const removed = warnings.splice(index, 1)[0];

  updateUser(guild.id, target.id, { warnings });

  await sendModLog(guild, {
    action: "UNWARN",
    targetId: target.id,
    moderatorId: moderator.id,
    reason: `Warning #${number} removed: ${removed.reason || "No reason provided"}`
  });

  return `✅ Warning #${number} हटा दी गई।\n**Reason:** ${removed.reason || "No reason provided"}`;
}

module.exports = {
  name: "removewarn",
  aliases: ["deletewarn", "unwarn"],

  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Remove a warning from a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("number")
        .setDescription("Warning number, starting from the latest")
        .setMinValue(1)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,removewarn @user 1`");
    }

    const number = Number(args[1]);

    const result = await removeWarning(
      message.guild,
      target,
      message.author,
      number
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const number = interaction.options.getInteger("number");

    const result = await removeWarning(
      interaction.guild,
      target,
      interaction.user,
      number
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
