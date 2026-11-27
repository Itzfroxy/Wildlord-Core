const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const { saveTicketConfig } = require("../../utils/ticketManager");

module.exports = {
  name: "ticketcategory",
  aliases: ["tcategory", "setticketcategory"],

  data: new SlashCommandBuilder()
    .setName("ticketcategory")
    .setDescription("Set the ticket channel category")
    .addChannelOption(option =>
      option.setName("category")
        .setDescription("Category where tickets will be created")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ तुम्हें Manage Server permission चाहिए।");
    }

    const category = message.guild.channels.cache.get(args[0]);

    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply("❌ सही Category ID डालो।");
    }

    saveTicketConfig(message.guild.id, {
      categoryId: category.id,
      enabled: true
    });

    return message.reply(`✅ Ticket Category सेट हो गई: **${category.name}**`);
  },

  async executeSlash(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "❌ तुम्हें Manage Server permission चाहिए।",
        ephemeral: true
      });
    }

    const category = interaction.options.getChannel("category");

    saveTicketConfig(interaction.guild.id, {
      categoryId: category.id,
      enabled: true
    });

    return interaction.reply({
      content: `✅ Ticket Category सेट हो गई: **${category.name}**`,
      ephemeral: true
    });
  }
};
