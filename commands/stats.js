
module.exports = {
  name: "stats",

  async execute(message, args, client) {
    const member = message.member;

    const joinedAt = member.joinedAt
      ? Math.floor(member.joinedAt.getTime() / 1000)
      : null;

    const createdAt = Math.floor(
      message.author.createdAt.getTime() / 1000
    );

    const embed = {
      color: 0x8b5cf6,
      title: `${message.author.username} - Stats`,
      thumbnail: {
        url: message.author.displayAvatarURL({ size: 256 })
      },
      fields: [
        {
          name: "User",
          value: `${message.author}`,
          inline: true
        },
        {
          name: "Server",
          value: `${message.guild.name}`,
          inline: true
        },
        {
          name: "Account Created",
          value: `<t:${createdAt}:R>`,
          inline: false
        },
        {
          name: "Joined Server",
          value: joinedAt ? `<t:${joinedAt}:R>` : "Unknown",
          inline: false
        }
      ],
      footer: {
        text: "Wildlord Core"
      },
      timestamp: new Date().toISOString()
    };

    await message.reply({ embeds: [embed] });
  }
};
