const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function createAvatarEmbed(user) {
  const avatar = user.displayAvatarURL({
    extension: "png",
    size: 4096
  });

  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`🖼️ ${user.username}'s Avatar`)
    .setImage(avatar)
    .setDescription(`[Download Full HD Avatar](${avatar})`)
    .setFooter({ text: "Wildlord Core • Avatar System" });
}

module.exports = {
  name: "avatar",
  aliases: ["av", "pfp"],

  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View a member's avatar")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Select a member")
        .setRequired(false)
    ),

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    await message.reply({
      embeds: [createAvatarEmbed(user)]
    });
  },

  async executeSlash(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    await interaction.reply({
      embeds: [createAvatarEmbed(user)]
    });
  }
};
