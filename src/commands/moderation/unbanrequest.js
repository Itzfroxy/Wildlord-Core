
const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const { getGuild, updateGuild } = require("../../utils/database");

function createRequest(guildId, user, reason) {
  const guildData = getGuild(guildId);
  const requests = guildData.unbanRequests || [];

  if (requests.some(request =>
    request.userId === user.id && request.status === "pending"
  )) {
    return "❌ तुम्हारी एक Unban Request पहले से Pending है।";
  }

  requests.push({
    userId: user.id,
    username: user.tag,
    reason,
    status: "pending",
    date: new Date().toISOString()
  });

  updateGuild(guildId, { unbanRequests: requests });

  return "✅ तुम्हारी Unban Request दर्ज हो गई है।";
}

module.exports = {
  name: "unbanrequest",
  aliases: ["ubrequest"],

  data: new SlashCommandBuilder()
    .setName("unbanrequest")
    .setDescription("Submit an unban request")
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Why should you be unbanned?")
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(message, args) {
    const reason = args.join(" ");

    if (!reason) {
      return message.reply("Usage: `,unbanrequest I want to appeal my ban`");
    }

    return message.reply(
      createRequest(message.guild.id, message.author, reason)
    );
  },

  async executeSlash(interaction) {
    const reason = interaction.options.getString("reason");

    return interaction.reply({
      content: createRequest(interaction.guild.id, interaction.user, reason),
      ephemeral: true
    });
  }
};
