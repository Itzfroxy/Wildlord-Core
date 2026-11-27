const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getUser, updateUser } = require("../../utils/database");

async function addNote(guild, target, moderator, content) {
  const executor = await guild.members.fetch(moderator.id);

  if (!executor.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return "❌ तुम्हारे पास Moderate Members Permission नहीं है।";
  }

  if (!content || content.length > 1000) {
    return "❌ Note 1 से 1000 Characters का होना चाहिए।";
  }

  const userData = getUser(guild.id, target.id);
  const notes = userData.notes || [];

  notes.push({
    id: Date.now().toString(),
    content,
    moderatorId: moderator.id,
    date: new Date().toISOString()
  });

  updateUser(guild.id, target.id, { notes });

  return new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle("📝 Staff Note Saved")
    .addFields(
      { name: "Member", value: target.tag },
      { name: "Staff", value: moderator.tag },
      { name: "Note", value: content },
      { name: "Total Notes", value: `${notes.length}` }
    )
    .setTimestamp();
}

module.exports = {
  name: "note",
  aliases: ["addnote", "staffnote"],

  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Save a private staff note for a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("content")
        .setDescription("Staff note")
        .setMaxLength(1000)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,note @user Your note`");
    }

    const content = args.slice(1).join(" ");

    if (!content) {
      return message.reply("❌ Note लिखना जरूरी है।");
    }

    const result = await addNote(
      message.guild, target, message.author, content
    );

    return message.reply(
      typeof result === "string" ? result : { embeds: [result] }
    );
  },

  async executeSlash(interaction) {
    const target = interaction.options.getUser("user");
    const content = interaction.options.getString("content");

    const result = await addNote(
      interaction.guild, target, interaction.user, content
    );

    return interaction.reply({
      embeds: typeof result === "string" ? [] : [result],
      content: typeof result === "string" ? result : undefined,
      ephemeral: true
    });
  }
};
