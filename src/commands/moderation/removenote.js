const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");

async function removeNote(guild, target, moderator, noteNumber) {
  const executor = await guild.members.fetch(moderator.id);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  const userData = getUser(guild.id, target.id);
  const notes = userData.notes || [];

  if (
    !Number.isInteger(noteNumber) ||
    noteNumber < 1 ||
    noteNumber > notes.length
  ) {
    return `❌ गलत Note Number! इस Member के पास ${notes.length} Notes हैं।`;
  }

  const removed = notes.splice(noteNumber - 1, 1)[0];

  updateUser(guild.id, target.id, { notes });

  return `✅ Member **${target.tag}** का Note #${noteNumber} हटा दिया गया।\n**Removed Note:** ${removed.content}`;
}

module.exports = {
  name: "removenote",
  aliases: ["deletenote"],

  data: new SlashCommandBuilder()
    .setName("removenote")
    .setDescription("Remove a specific staff note")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("number")
        .setDescription("Note number shown in the notes list")
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
      return message.reply("Usage: `,removenote @user 1`");
    }

    const number = Number(args[1]);

    const result = await removeNote(
      message.guild, target, message.author, number
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const number = interaction.options.getInteger("number");

    const result = await removeNote(
      interaction.guild, target, interaction.user, number
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
