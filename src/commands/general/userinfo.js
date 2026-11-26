const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

async function createUserEmbed(guild, user) {
  const member = await guild.members.fetch(user.id).catch(() => null);

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`👤 ${user.username} — User Info`)
    .setThumbnail(user.displayAvatarURL({ size: 1024 }))
    .addFields(
      { name: "🏷️ Username", value: user.tag, inline: true },
      { name: "🆔 User ID", value: user.id, inline: true },
      {
        name: "📅 Account Created",
        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
        inline: false
      }
    );

  if (member) {
    const roles = member.roles.cache
      .filter(role => role.id !== guild.id)
      .map(role => role.toString());

    embed.addFields(
      {
        name: "📥 Joined Server",
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
        inline: false
      },
      {
        name: "🎭 Roles",
        value: roles.length ? roles.join(", ").slice(0, 1000) : "No roles",
        inline: false
      },
      {
        name: "🤖 Bot Account",
        value: user.bot ? "Yes" : "No",
        inline: true
      }
    );
  }

  return embed.setFooter({ text: "Wildlord Core • User Information" }).setTimestamp();
}

module.exports = {
  name: "userinfo",
  aliases: ["whois", "ui"],

  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show user information")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Select a member")
        .setRequired(false)
    ),

  async execute(message) {
    const user = message.mentions.users.first() || message.author;
    await message.reply({
      embeds: [await createUserEmbed(message.guild, user)]
    });
  },

  async executeSlash(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    await interaction.reply({
      embeds: [await createUserEmbed(interaction.guild, user)]
    });
  }
};
