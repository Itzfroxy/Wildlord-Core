
require("dotenv").config();

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { getUser, updateUser } = require("./utils/database");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
client.prefix = ",";

const cooldowns = new Map();

// Load commands
const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (command.name && typeof command.execute === "function") {
      client.commands.set(command.name, command);
    }
  }
}

// Message handler and XP system
client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;

  // XP system: one XP reward per user every 60 seconds
  const cooldownKey = `${message.guild.id}-${message.author.id}`;
  const now = Date.now();
  const lastXP = cooldowns.get(cooldownKey) || 0;

  if (now - lastXP >= 60000) {
    cooldowns.set(cooldownKey, now);

    const userData = getUser(message.guild.id, message.author.id);
    const gainedXP = Math.floor(Math.random() * 11) + 5;
    const newXP = userData.xp + gainedXP;
    const newLevel = Math.floor(newXP / 100);

    updateUser(message.guild.id, message.author.id, {
      xp: newXP,
      level: newLevel,
      messages: userData.messages + 1,
      voiceTime: userData.voiceTime
    });

    if (newLevel > userData.level) {
      message.channel.send(
        `🎉 ${message.author} reached Level ${newLevel}!`
      ).catch(() => {});
    }
  }

  // Prefix commands
  if (!message.content.startsWith(client.prefix)) return;

  const args = message.content
    .slice(client.prefix.length)
    .trim()
    .split(/\s+/);

  const commandName = args.shift()?.toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply("Command execute karte waqt error aa gaya.");
  }
});

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

if (!process.env.TOKEN) {
  console.error("TOKEN .env environment variable missing!");
  process.exit(1);
}

client.login(process.env.TOKEN);
