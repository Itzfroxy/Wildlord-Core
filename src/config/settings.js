
module.exports = {
  bot: {
    name: "Wildlord Core",
    prefix: process.env.PREFIX || ","
  },

  database: {
    type: "json",
    directory: "./data"
  },

  leveling: {
    enabled: true,
    xpPerMessageMin: 5,
    xpPerMessageMax: 15,
    cooldownSeconds: 60,
    xpPerLevel: 100
  },

  features: {
    moderation: true,
    automod: true,
    tickets: true,
    selfRoles: true,
    colorRoles: true,
    reviews: true,
    leveling: true,
    voiceStats: true,
    aiChat: true,
    fun: true,
    games: true,
    social: true
  }
};
