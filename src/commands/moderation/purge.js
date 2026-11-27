const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

async function purgeMessages(channel, amount) {
  if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
    return "❌ 1 से 100 के बीच संख्या डालो।";
  }

  try {
    const deleted = await channel.bulkDelete(amount, true);

    return `🧹 Successfully deleted **${deleted.size}** messages.\n⚠️ Discord पुराने 14 दिन से अधिक के messages bulk delete नहीं करता।`;
  } catch (error) {
    console.error("Purge error:", error);
    return "❌ Messages Delete नहीं हो पाए। Bot की Manage Messages Permission चेक करो।";
  }
}

module.exports = {
  name: "purge",
  aliases: ["clear", "clean"],

  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages from this channel")
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Number of messages (1-100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("❌ तुम्हारे पास Manage Messages Permission नहीं है।");
    }

    const amount = Number(args[0]);

    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      return message.reply("Usage: `,purge 1-100`");
    }

    const result = await purgeMessages(message.channel, amount);

    await message.channel.send(result);
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Manage Messages Permission नहीं है।",
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger("amount");

    await interaction.deferReply({ ephemeral: true });

    const result = await purgeMessages(interaction.channel, amount);

    await interaction.editReply(result);
  }
};
