const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getTicketData } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketsetup",
  aliases: ["tsetup", "ticketstatus"],

  data: new SlashCommandBuilder()
    .setName("ticketsetup")
    .setDescription("Check ticket system configuration"),

  async execute(message) {
    const result = getSetup(message.guild, message.member);

    if (typeof result === "string") {
      return message.reply(result);
    }

    return message.reply({ embeds: [result] });
  },

  async executeSlash(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const result = getSetup(interaction.guild, interaction.member);

    if (typeof result === "string") {
      return interaction.editReply(result);
    }

    return interaction.editReply({ embeds: [result] });
  }
};

function getSetup(guild, member) {
  if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return "❌ तुम्हें Manage Server permission चाहिए।";
  }

  const config = getTicketData(guild.id).ticketConfig;

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle("🎫 Ticket System Setup")
    .addFields(
      {
        name: "System Status",
        value: config.enabled ? "🟢 Enabled" : "🔴 Disabled",
        inline: true
      },
      {
        name: "Ticket Category",
        value: config.categoryId ? `<#${config.categoryId}>` : "❌ Not Set",
        inline: true
      },
      {
        name: "Staff Role",
        value: config.staffRoleId ? `<@&${config.staffRoleId}>` : "❌ Not Set",
        inline: true
      },
      {
        name: "Log Channel",
        value: config.logChannelId ? `<#${config.logChannelId}>` : "❌ Not Set",
        inline: true
      },
      {
        name: "Panel Title",
        value: config.panelTitle || "Default",
        inline: true
      },
      {
        name: "Panel Color",
        value: config.panelColor || "Default",
        inline: true
      }
    )
    .setFooter({ text: "Wildlord Core Ticket Configuration" })
    .setTimestamp();

  return embed;
}
