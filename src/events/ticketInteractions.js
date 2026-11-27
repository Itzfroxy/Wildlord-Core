
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
      const guild = interaction.guild;
      const user = interaction.user;

      if (!guild) {
        return interaction.editReply("❌ Server में ही Ticket खोल सकते हो।");
      }

      const config = getTicketData(guild.id).ticketConfig;

      const existing = getUserOpenTicket(guild.id, user.id);

      if (existing) {
        const existingChannel = await guild.channels
          .fetch(existing.channelId)
          .catch(() => null);

        if (existingChannel) {
          return interaction.editReply(
            `❌ तुम्हारा Ticket पहले से खुला है: ${existingChannel}`
          );
        }
      }

      const botMember = guild.members.me;

      if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.editReply(
          "❌ Bot के पास Manage Channels Permission नहीं है।"
        );
      }

      const overwrites = [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        },
        {
          id: botMember.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ];

      if (config.staffRoleId) {
        const staffRole = guild.roles.cache.get(config.staffRoleId);

        if (staffRole) {
          overwrites.push({
            id: staffRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          });
        }
      }

      const channelName = `ticket-${user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 90);

      const channel = await guild.channels.create({
        name: channelName || `ticket-${user.id}`,
        type: ChannelType.GuildText,
        parent: config.categoryId || undefined,
        permissionOverwrites: overwrites,
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
          `Hello ${user}!\n\nYour support ticket has been created. Staff will assist you soon.`
        )
        .addFields(
          { name: "Ticket Owner", value: `${user}`, inline: true },
          { name: "Status", value: "🟢 Open", inline: true }
        )
        .setTimestamp();

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket:claim")
          .setLabel("Claim")
          .setEmoji("🙋")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("ticket:close")
          .setLabel("Close")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket:reopen")
          .setLabel("Reopen")
          .setEmoji("🔓")
          .setStyle(ButtonStyle.Success)
      );

      await channel.send({
        content: config.staffRoleId
          ? `<@&${config.staffRoleId}> ${user}`
          : `${user}`,
        embeds: [embed],
        components: [row1, row2]
      });

      return interaction.editReply(
        `✅ तुम्हारा Ticket बन गया: ${channel}`
      );

    } catch (error) {
      console.error("Ticket Create Error:", error);

      return interaction.editReply(
        "❌ Ticket बनाते समय Error आया। Bot Permissions और Ticket Settings चेक करो।"
      ).catch(() => {});
    }
  }
};
