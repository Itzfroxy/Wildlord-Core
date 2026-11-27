const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { saveTicketConfig } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketstaffrole",
  aliases: ["tstaffrole", "setticketstaff"],

  data: new SlashCommandBuilder()
    .setName("ticketstaffrole")
    .setDescription("Set the staff role for tickets")
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("Role allowed to manage tickets")
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ तुम्हें Manage Server permission चाहिए।");
    }

    const role = message.guild.roles.cache.get(args[0]);

    if (!role) {
      return message.reply("❌ सही Role ID डालो।");
    }

    saveTicketConfig(message.guild.id, {
      staffRoleId: role.id
    });

    return message.reply(`✅ Ticket Staff Role सेट हो गई: ${role}`);
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Server permission चाहिए।",
        ephemeral: true
      });
    }

    const role = interaction.options.getRole("role");

    saveTicketConfig(interaction.guild.id, {
      staffRoleId: role.id
    });

    return interaction.reply({
      content: `✅ Ticket Staff Role सेट हो गई: ${role}`,
      ephemeral: true
    });
  }
};
