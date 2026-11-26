
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getUser, updateUser } = require("../utils/database");

module.exports = {
  name: "card",

  async execute(message) {
    getUser(message.guild.id, message.author.id);

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("wc_purple")
        .setLabel("Purple")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("wc_blue")
        .setLabel("Blue")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("wc_green")
        .setLabel("Green")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("wc_red")
        .setLabel("Red")
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("wc_done")
        .setLabel("Done")
        .setStyle(ButtonStyle.Secondary)
    );

    const menu = await message.reply({
      content: "🎨 **Wildlord Core — Card Customization**\nChoose a colour for your Stats Card:",
      components: [row1, row2]
    });

    const collector = menu.createMessageComponentCollector({
      time: 120000
    });

    collector.on("collect", async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "This menu belongs to another user.",
          ephemeral: true
        });
      }

      const colors = {
        wc_purple: "#8b5cf6",
        wc_blue: "#3b82f6",
        wc_green: "#22c55e",
        wc_red: "#ef4444"
      };

      if (interaction.customId === "wc_done") {
        await interaction.update({
          content: "✅ Card customization finished!",
          components: []
        });
        collector.stop();
        return;
      }

      const color = colors[interaction.customId];

      if (!color) return;

      updateUser(message.guild.id, message.author.id, {
        cardColor: color
      });

      await interaction.reply({
        content: `✅ Your card colour has been saved: ${color}\nUse ,stats to see your card.`,
        ephemeral: true
      });
    });

    collector.on("end", async () => {
      try {
        await menu.edit({ components: [] });
      } catch {}
    });
  }
};
