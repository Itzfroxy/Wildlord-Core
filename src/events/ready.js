module.exports = {
  name: "clientReady",
  once: true,

  async execute(client) {
    console.log("--------------------------------");
    console.log(`🤖 ${client.user.tag} is online!`);
    console.log(`🆔 Bot ID: ${client.user.id}`);
    console.log(`🌐 Servers: ${client.guilds.cache.size}`);
    console.log(`👥 Users: ${client.users.cache.size}`);
    console.log("--------------------------------");

    client.user.setPresence({
      activities: [
        {
          name: "Wildlord Core | ,help",
          type: 0
        }
      ],
      status: "online"
    });
  }
};
