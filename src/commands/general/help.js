const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function createHelpEmbed(client) {
  const commands = [
    {
      name: "📊 Statistics",
      value: "`stats`, `leaderboard`"
    },
    {
      name: "🤖 Bot Information",
      value: "`ping`, `botinfo`, `help`"
    },
    {
      name: "🌐 Server Information",
      value: "`serverinfo`, `userinfo`"
    },
    {
      name: "🖼️ Profile",
      value: "`avatar`"
    }
  ];

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("📚 Wildlord Core — Help Menu")
    .setDescription(
      `Hello ${client.user.username}! नीचे उपलब्ध Commands देखो।\n\nPrefix: \`,\``
    )
    .addFields(commands)
    .setFooter({
      text: `Total Loaded Commands: ${client.slashCommands.size}`
    })
    .setTimestamp();

  return embed;
}

module.exports = {
  name: "help",
  aliases: ["commands", "cmds"],

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available bot commands"),

  async execute(message, args, client) {
    await message.reply({
      embeds: [createHelpEmbed(client)]
    });
  },

  async executeSlash(interaction, client) {
    await interaction.reply({
      embeds: [createHelpEmbed(client)]
    });
  }
};
