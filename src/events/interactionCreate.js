module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(
        interaction.commandName
      );

      if (!command) {
        return interaction.reply({
          content: "❌ यह कमांड नहीं मिली।",
          ephemeral: true
        });
      }

      try {
        await command.executeSlash(interaction, client);
      } catch (error) {
        console.error("Slash command error:", error);

        const reply = {
          content: "❌ कमांड चलाते समय error आया।",
          ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
    }
  }
};
