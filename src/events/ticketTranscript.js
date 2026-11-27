
const {
  AttachmentBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { getTicketData } = require("../utils/ticketManager");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "ticket:transcript") return;

    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;
      const channel = interaction.channel;
      const member = interaction.member;

      const ticketData = getTicketData(guild.id);
      const ticket = ticketData.tickets.find(
        item => item.channelId === channel.id
      );

      if (!ticket) {
        return interaction.editReply("❌ Ticket Database में नहीं मिला।");
      }

      const isStaff =
        member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        (ticketData.ticketConfig.staffRoleId &&
          member.roles.cache.has(ticketData.ticketConfig.staffRoleId));

      if (!isStaff && ticket.ownerId !== member.id) {
        return interaction.editReply(
          "❌ केवल Ticket Owner या Staff Transcript बना सकते हैं।"
        );
      }

      const messages = [];
      let lastId;

      while (messages.length < 1000) {
        const batch = await channel.messages.fetch({
          limit: 100,
          ...(lastId ? { before: lastId } : {})
        });

        if (batch.size === 0) break;

        messages.push(...batch.values());
        lastId = batch.last().id;

        if (batch.size < 100) break;
      }

      messages.sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
      );

      const transcript = messages.map(message => {
        const date = new Date(message.createdTimestamp).toISOString();

        const content = message.content || "[No text content]";

        const attachments = message.attachments.map(
          attachment => attachment.url
        ).join(" ");

        return `[${date}] ${message.author.tag}: ${content}${attachments ? " | Attachments: " + attachments : ""}`;
      }).join("\n");

      const file = new AttachmentBuilder(
        Buffer.from(transcript || "No messages found.", "utf8"),
        { name: `transcript-${channel.id}.txt` }
      );

      const logChannelId = ticketData.ticketConfig.logChannelId;

      if (logChannelId) {
        const logChannel = await guild.channels.fetch(logChannelId)
          .catch(() => null);

        if (logChannel && logChannel.isTextBased() && logChannel.isSendable()) {
          await logChannel.send({
            content: `📄 Transcript: ${channel.name}`,
            files: [file]
          });
        }
      }

      return interaction.editReply({
        content: "✅ Transcript तैयार हो गया!",
        files: [file]
      });

    } catch (error) {
      console.error("Ticket Transcript Error:", error);

      return interaction.editReply(
        "❌ Transcript बनाते समय Error आया।"
      ).catch(() => {});
    }
  }
};
