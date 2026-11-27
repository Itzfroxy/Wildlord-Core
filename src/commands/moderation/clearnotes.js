
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");

module.exports = {
  name: "clearnotes",
  aliases: ["resetnotes"],

  data: new SlashCommandBuilder()
    .setName("clearnotes")
    .setDescription("Clear all staff notes of a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member whose notes should be cleared")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,clearnotes @user`");
    }

    const userData = getUser(message.guild.id, target.id);
    const count = (userData.notes || []).length;

    if (count === 0) {
      return message.reply("इस Member के कोई Staff Notes नहीं हैं।");
    }

    updateUser(message.guild.id, target.id, { notes: [] });

    return message.reply(
      `✅ **${target.tag}** के सभी ${count} Staff Notes हटा दिए गए।`
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const userData = getUser(interaction.guild.id, target.id);
    const count = (userData.notes || []).length;

    if (count === 0) {
      return interaction.reply({
        content: "इस Member के कोई Staff Notes नहीं हैं।",
        ephemeral: true
      });
    }

    updateUser(interaction.guild.id, target.id, { notes: [] });

    return interaction.reply({
      content: `✅ **${target.tag}** के सभी ${count} Staff Notes हटा दिए गए।`,
      ephemeral: true
    });
  }
};
