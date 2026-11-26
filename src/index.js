require("dotenv").config();

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const settings = require("./config/settings");
const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User
  ]
});

client.config = settings;
client.commands = new Collection();
client.slashCommands = new Collection();
client.interactions = new Collection();

loadCommands(client);
loadEvents(client);

client.on("error", error => {
  console.error("Discord Client Error:", error);
});

process.on("unhandledRejection", error => {
  console.error("Unhandled Rejection:", error);
});

if (!process.env.TOKEN) {
  console.error("❌ TOKEN missing in environment variables!");
  process.exit(1);
}

client.login(process.env.TOKEN);
