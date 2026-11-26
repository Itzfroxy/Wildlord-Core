
const { getUser, getRank } = require("../utils/database");
const { renderStatsCard } = require("../utils/cardRenderer");
const { AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "stats",

  async execute(message, args, client) {
    const target = message.mentions.members.first() || message.member;
    const data = getUser(message.guild.id, target.id);
    const rank = getRank(message.guild.id, target.id);

    const imageBuffer = await renderStatsCard(target, data, rank);

    const attachment = new AttachmentBuilder(imageBuffer, {
      name: "wildlord-stats.png"
    });

    await message.reply({
      files: [attachment]
    });
  }
};
