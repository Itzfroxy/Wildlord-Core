
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");

function removeWarning(guildId, targetId, number) {
  const userData = getUser(guildId, targetId);
  const warnings = userData.warnings || [];

  if (!Number.isInteger(number) || number < 1 || number > warnings.length) {
    return `❌ गलत Warning Number! इस Member के पास ${warnings.length} Warnings हैं।`;
  }

  const index = warnings.length - number;
  const removed = warnings.splice(index, 1)[0];

  updateUser(guildId, targetId, { warnings });

  return `✅ Warning #${number} हटा दी गई।\n**Reason:** ${removed.reason}`;
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
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,removewarn @user 1`");
    }

    const number = Number(args[1]);

    return message.reply(
      removeWarning(message.guild.id, target.id, number)
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const number = interaction.options.getInteger("number");

    return interaction.reply({
      content: removeWarning(interaction.guild.id, target.id, number),
      ephemeral: true
    });
  }
};
