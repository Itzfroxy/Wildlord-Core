const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getUser } = require("../../utils/database");

function createNotesEmbed(target, notes) {
  const embed = new EmbedBuilder()
    .setColor("#3498DB")
    .setTitle(`📝 Staff Notes: ${target.tag}`)
    .setDescription(`Total Notes: **${notes.length}**`)
    .setTimestamp();

  notes.slice(-10).reverse().forEach((note, index) => {
    embed.addFields({
      name: `Note ${notes.length - index}`,
      value:
        `**Note:** ${note.content}\n` +
        `**Staff:** <@${note.moderatorId}>\n` +
        `**Date:** <t:${Math.floor(new Date(note.date).getTime() / 1000)}:R>`
    });
  });

  if (notes.length === 0) {
    embed.setDescription("इस Member के कोई Staff Notes नहीं हैं।");
  }

  return embed;
}

module.exports = {
  name: "notes",
  aliases: ["viewnotes", "staffnotes"],

  data: new SlashCommandBuilder()
    .setName("notes")
    .setDescription("View private staff notes of a member")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member whose notes you want to view")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ तुम्हारे पास Moderate Members Permission नहीं है।");
    }

    const target = message.mentions.users.first();

    if (!target) {
      return message.reply("Usage: `,notes @user`");
    }

    const userData = getUser(message.guild.id, target.id);
    const notes = userData.notes || [];
    const embed = createNotesEmbed(target, notes);

    try {
      await message.author.send({ embeds: [embed] });
      return message.reply("✅ Private Notes तुम्हारे DM में भेज दिए गए हैं।");
    } catch {
      return message.reply("❌ तुम्हारे DM बंद हैं। Notes भेज नहीं पाए।");
    }
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: "❌ तुम्हारे पास Moderate Members Permission नहीं है।",
        ephemeral: true
      });
    }

    const target = interaction.options.getUser("user");
    const userData = getUser(interaction.guild.id, target.id);
    const notes = userData.notes || [];

    return interaction.reply({
      embeds: [createNotesEmbed(target, notes)],
      ephemeral: true
    });
  }
};
