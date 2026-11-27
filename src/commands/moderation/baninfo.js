
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  name: "baninfo",
  aliases: ["checkban", "bancheck"],

  data: new SlashCommandBuilder()
    .setName("baninfo")
    .setDescription("Check whether a user is banned")
    .addStringOption(option =>
      option.setName("userid")
        .setDescription("Discord user ID")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ तुम्हारे पास Ban Members Permission नहीं है।");
    }

    const userId = args[0]?.replace(/[<@!>]/g, "");

    if (!/^\d{17,20}$/.test(userId || "")) {
      return message.reply("❌ सही Discord User ID डालो।");
    }

    try {
      const ban = await message.guild.bans.fetch(userId);

      const embed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setTitle("🔨 Ban Information")
        .addFields(
          { name: "User", value: `${ban.user.tag}` },
          { name: "User ID", value: ban.user.id },
          { name: "Reason", value: ban.reason || "No reason provided" }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch {
      return message.reply("✅ यह User इस Server में Banned नहीं है।");
    }
  },

  async executeSlash(interaction) {
    const userId = interaction.options.getString("userid")
      .replace(/[<@!>]/g, "");

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({
        content: "❌ सही Discord User ID डालो।",
        ephemeral: true
      });
    }

    try {
      const ban = await interaction.guild.bans.fetch(userId);

      const embed = new EmbedBuilder()
        .setColor("#E74C3C")
        .setTitle("🔨 Ban Information")
        .addFields(
          { name: "User", value: ban.user.tag },
          { name: "User ID", value: ban.user.id },
          { name: "Reason", value: ban.reason || "No reason provided" }
        )
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    } catch {
      return interaction.reply({
        content: "✅ यह User इस Server में Banned नहीं है।",
        ephemeral: true
      });
    }
  }
};
