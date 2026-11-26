
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  name: "unbanall",
  aliases: ["massunban"],

  data: new SlashCommandBuilder()
    .setName("unbanall")
    .setDescription("Unban all banned users from this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ केवल Administrator यह Command चला सकता है।");
    }

    const confirmation = await message.reply(
      "⚠️ क्या तुम सच में Server के सभी Banned Users को Unban करना चाहते हो? 10 सेकंड में `YES` लिखो।"
    );

    try {
      const collected = await message.channel.awaitMessages({
        filter: msg =>
          msg.author.id === message.author.id &&
          msg.content.toUpperCase() === "YES",
        max: 1,
        time: 10000
      });

      if (!collected.size) {
        return message.channel.send("❌ Confirmation नहीं मिला। प्रक्रिया रद्द।");
      }

      const bans = await message.guild.bans.fetch();

      if (!bans.size) {
        return message.channel.send("इस Server में कोई Banned User नहीं है।");
      }

      let count = 0;

      for (const [userId] of bans) {
        try {
          await message.guild.members.unban(
            userId,
            `Mass unban by ${message.author.tag}`
          );
          count++;
        } catch {}
      }

      return message.channel.send(
        `✅ ${count} Users को Unban कर दिया गया।`
      );
    } catch {
      return message.channel.send("❌ Unban प्रक्रिया पूरी नहीं हो सकी।");
    }
  },

  async executeSlash(interaction) {
    return interaction.reply({
      content: "⚠️ यह Mass Unban Command अभी केवल Prefix से उपलब्ध है: `,unbanall`",
      ephemeral: true
    });
  }
};
