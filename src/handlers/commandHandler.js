
const fs = require("fs");
const path = require("path");

function loadCommands(client) {
  client.commands.clear();
  client.slashCommands.clear();

  const commandsPath = path.join(__dirname, "..", "commands");

  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
    console.log("Commands folder created.");
    return;
  }

  function readCommandFiles(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(directory, file.name);

      if (file.isDirectory()) {
        readCommandFiles(fullPath);
        continue;
      }

      if (!file.isFile() || !file.name.endsWith(".js")) continue;

      try {
        delete require.cache[require.resolve(fullPath)];
        const command = require(fullPath);

        if (!command.name || typeof command.execute !== "function") {
          console.warn(`Skipped invalid command: ${fullPath}`);
          continue;
        }

        client.commands.set(command.name.toLowerCase(), command);

        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            client.commands.set(alias.toLowerCase(), command);
          }
        }

        if (command.data && command.data.name) {
          client.slashCommands.set(command.data.name, command);
        }

        console.log(`Loaded command: ${command.name}`);
      } catch (error) {
        console.error(`Failed to load ${fullPath}:`, error);
      }
    }
  }

  readCommandFiles(commandsPath);

  console.log(
    `Loaded ${client.commands.size} prefix entries and ${client.slashCommands.size} slash commands.`
  );
}

module.exports = { loadCommands };
