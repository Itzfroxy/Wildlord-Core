
const fs = require("fs");
const path = require("path");

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "..", "events");

  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
    console.log("Events folder created.");
    return;
  }

  function readEventFiles(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(directory, file.name);

      if (file.isDirectory()) {
        readEventFiles(fullPath);
        continue;
      }

      if (!file.isFile() || !file.name.endsWith(".js")) continue;

      try {
        delete require.cache[require.resolve(fullPath)];
        const event = require(fullPath);

        if (!event.name || typeof event.execute !== "function") {
          console.warn(`Skipped invalid event: ${fullPath}`);
          continue;
        }

        const handler = (...args) => event.execute(...args, client);

        if (event.once) {
          client.once(event.name, handler);
        } else {
          client.on(event.name, handler);
        }

        console.log(`Loaded event: ${event.name}`);
      } catch (error) {
        console.error(`Failed to load event ${fullPath}:`, error);
      }
    }
  }

  readEventFiles(eventsPath);
}

module.exports = { loadEvents };
