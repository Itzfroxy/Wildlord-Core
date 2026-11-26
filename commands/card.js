
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "card",

  async execute(message) {
    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle("🎨 Card Customization")
      .setDescription(
        "Welcome to Wildlord Core Card Customization!\n\n" +
        "Customize your profile card using the buttons below.\n\n" +
        "Choose an option to get started."
      )
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Wildlord Core • Card Menu" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("wildlord_customize")
        .setLabel("Customize")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("wildlord_surprise")
        .setLabel("Surprise Me")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("wildlord_done")
        .setLabel("Done")
        .setStyle(ButtonStyle.Success)
    );

    const sent = await message.reply({
      embeds: [embed],
      components: [row]
    });

    const collector = sent.createMessageComponentCollector({
      time: 120000
    });

    collector.on("collect", async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "This card menu is not yours!",
          ephemeral: true
        });
      }

      if (interaction.customId === "wildlord_customize") {
        await interaction.reply({
          content: "🎨 More customization options are coming soon!",
          ephemeral: true
        });
      }

      if (interaction.customId === "wildlord_surprise") {
        await interaction.reply({
          content: "✨ Surprise designs are coming soon!",
          ephemeral: true
        });
      }

      if (interaction.customId === "wildlord_done") {
        await interaction.reply({
          content: "✅ Menu closed!",
          ephemeral: true
        });
        collector.stop();
      }
    });

    collector.on("end", async () => {
      try {
        await sent.edit({ components: [] });
      } catch {}
    });
  }
};
