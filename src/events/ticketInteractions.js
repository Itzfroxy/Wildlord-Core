const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const {
  getTicketData,
  saveTicket,
  getUserOpenTicket
} = require("../utils/ticketManager");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "ticket:create") return;

    await interaction.deferReply({ ephemeral: true });

    try {
      if (!interaction.guild) {
        return interaction.editReply("❌ Server के अंदर ही ticket खोल सकते हो।");
      }

      const guild = interaction.guild;
      const user = interaction.user;
      const config = getTicketData(guild.id).ticketConfig;

      if (config.enabled === false) {
        return interaction.editReply("❌ Ticket system अभी configure नहीं हुआ है।");
      }

      const existing = getUserOpenTicket(guild.id, user.id);

      if (existing) {
        return interaction.editReply(
          `❌ तुम्हारा ticket पहले से खुला है: <#${existing.channelId}>`
        );
      }

      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.editReply(
          "❌ Bot के पास Manage Channels permission नहीं है।"
        );
      }

      const channelName = `ticket-${user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 90);

      const permissionOverwrites = [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ];

      if (config.staffRoleId) {
        permissionOverwrites.push({
          id: config.staffRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        });
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: config.categoryId || undefined,
        permissionOverwrites,
        reason: `Ticket opened by ${user.tag}`
      });

      saveTicket(guild.id, {
        channelId: channel.id,
        ownerId: user.id,
        status: "open",
        createdAt: new Date().toISOString(),
        claimedBy: null
      });

      const embed = new EmbedBuilder()
        .setColor(config.panelColor || "#5865F2")
        .setTitle("🎫 Support Ticket")
        .setDescription(
          `Welcome <@${user.id}>!\n\nSupport team जल्द ही तुम्हारी मदद करेगा।\n\nअपनी समस्या यहाँ बताओ।`
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket:claim")
          .setLabel("Claim")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("ticket:transcript")
          .setLabel("Transcript")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket:close")
          .setLabel("Close")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `<@${user.id}>${config.staffRoleId ? ` <@&${config.staffRoleId}>` : ""}`,
        embeds: [embed],
        components: [row]
      });

      return interaction.editReply(
        `✅ तुम्हारा ticket बन गया: ${channel}`
      );
    } catch (error) {
      console.error("Ticket Create Error:", error);

      return interaction.editReply(
        "❌ Ticket बनाते समय error आया।"
      );
    }
  }
};
