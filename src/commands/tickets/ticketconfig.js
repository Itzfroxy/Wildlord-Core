
const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { saveTicketConfig } = require("../../utils/ticketManager");

const fields = {
  title: "panelTitle",
  description: "panelDescription",
  color: "panelColor",
  footer: "panelFooter",
  image: "panelImage",
  thumbnail: "panelThumbnail",
  button: "buttonLabel",
  emoji: "buttonEmoji"
};

async function configureTicket(guild, moderator, field, value) {
  if (!moderator.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return "❌ तुम्हारे पास Manage Server Permission नहीं है।";
  }

  if (!fields[field]) {
    return "❌ Field गलत है। Title, Description, Color, Footer, Image, Thumbnail, Button या Emoji इस्तेमाल करो।";
  }

  if (!value || !value.trim()) {
    return "❌ Value खाली नहीं हो सकती।";
  }

  value = value.trim();

  if (field === "color") {
    if (!/^#([0-9A-F]{6})$/i.test(value)) {
      return "❌ Color Hex में डालो। Example: #5865F2";
    }
  }

  if (field === "image" || field === "thumbnail") {
    try {
      new URL(value);
    } catch {
      return "❌ सही Image URL डालो।";
    }

    if (!/^https?:\/\//i.test(value)) {
      return "❌ Image URL HTTP या HTTPS से शुरू होना चाहिए।";
    }
  }

  if (value.length > 4000) {
    return "❌ Value बहुत बड़ी है। 4000 Characters से कम रखो।";
  }

  saveTicketConfig(guild.id, {
    [fields[field]]: value
  });

  return `✅ Ticket Panel का **${field}** सफलतापूर्वक Customize हो गया!\n\n**New Value:** ${value}`;
}

module.exports = {
  name: "ticketconfig",
  aliases: ["ticketcustomize", "tconfig"],

  data: new SlashCommandBuilder()
    .setName("ticketconfig")
    .setDescription("Customize the ticket panel")
    .addStringOption(option =>
      option.setName("field")
        .setDescription("What you want to customize")
        .setRequired(true)
        .addChoices(
          { name: "Title", value: "title" },
          { name: "Description", value: "description" },
          { name: "Color", value: "color" },
          { name: "Footer", value: "footer" },
          { name: "Image", value: "image" },
          { name: "Thumbnail", value: "thumbnail" },
          { name: "Button Label", value: "button" },
          { name: "Button Emoji", value: "emoji" }
        )
    )
    .addStringOption(option =>
      option.setName("value")
        .setDescription("New customization value")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(message, args) {
    const field = args[0]?.toLowerCase();
    const value = args.slice(1).join(" ");

    const result = await configureTicket(
      message.guild,
      message.member,
      field,
      value
    );

    return message.reply(result);
  },

  async executeSlash(interaction) {
    const field = interaction.options.getString("field");
    const value = interaction.options.getString("value");

    const result = await configureTicket(
      interaction.guild,
      interaction.member,
      field,
      value
    );

    return interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};
