require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commands = [];
const commandsPath = path.join(__dirname, "commands");

function loadSlashCommands(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(directory, file.name);

    if (file.isDirectory()) {
      loadSlashCommands(fullPath);
      continue;
    }

    if (!file.name.endsWith(".js")) continue;

    try {
      const command = require(fullPath);

      if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`Prepared: /${command.data.name}`);
      }
    } catch (error) {
      console.error(`Failed to load ${file.name}:`, error);
    }
  }
}

async function deployCommands() {
  if (!process.env.TOKEN || !process.env.CLIENT_ID) {
    throw new Error("TOKEN or CLIENT_ID is missing!");
  }

  loadSlashCommands(commandsPath);

  const rest = new REST({ version: "10" }).setToken(
    process.env.TOKEN
  );

  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );

  console.log(`Successfully registered ${commands.length} slash commands!`);
}

deployCommands().catch(console.error);
