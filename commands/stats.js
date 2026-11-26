
const { getUser } = require("../utils/database");

module.exports = {
  name: "stats",

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.member;
    const data = getUser(message.guild.id, target.id);

    const nextLevelXP = (data.level + 1) * 100;
    const currentLevelXP = data.level * 100;
    const progress = data.xp - currentLevelXP;

    const embed = {
      color: 0x8b5cf6,
      title: `${target.user.username} | Stats`,
      thumbnail: {
        url: target.user.displayAvatarURL({ size: 256 })
      },
      fields: [
        {
          name: "Level",
          value: `${data.level}`,
          inline: true
        },
        {
          name: "XP",
          value: `${data.xp}`,
          inline: true
        },
        {
          name: "Progress",
          value: `${progress} / 100 XP`,
          inline: true
        },
        {
          name: "Messages",
          value: `${data.messages}`,
          inline: true
        },
        {
          name: "Voice Time",
          value: `${Math.floor(data.voiceTime / 60)} minutes`,
          inline: true
        }
      ],
      footer: {
        text: `Next level: ${nextLevelXP} XP • Wildlord Core`
      },
      timestamp: new Date().toISOString()
    };

    await message.reply({ embeds: [embed] });
  }
};
