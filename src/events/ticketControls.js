
const {
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const {
  getTicket,
  saveTicket
} = require("../utils/ticketManager");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    if (!interaction.isButton()) return;

    const id = interaction.customId;

    if (!["ticket:claim", "ticket:close", "ticket:reopen"].includes(id)) {
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;
      const channel = interaction.channel;
      const member = interaction.member;

      const ticket = getTicket(guild.id, channel.id);

      if (!ticket) {
        return interaction.editReply("❌ यह Ticket Database में नहीं मिला।");
      }

      const staffRoleId = require("../utils/ticketManager")
        .getTicketData(guild.id).ticketConfig.staffRoleId;

      const isStaff =
        member.permissions.has(PermissionFlagsBits.ManageChannels) ||
        (staffRoleId && member.roles.cache.has(staffRoleId));

      if (id === "ticket:claim") {
        if (!isStaff) {
          return interaction.editReply("❌ केवल Staff Ticket Claim कर सकते हैं।");
        }

        if (ticket.claimedBy) {
          return interaction.editReply(
            `❌ यह Ticket पहले ही <@${ticket.claimedBy}> ने Claim कर लिया है।`
          );
        }

        saveTicket(guild.id, {
          ...ticket,
          claimedBy: member.id
        });

        return interaction.editReply("✅ Ticket Claim हो गया!");
      }

      if (id === "ticket:close") {
        if (!isStaff && ticket.ownerId !== member.id) {
          return interaction.editReply(
            "❌ केवल Ticket Owner या Staff इसे Close कर सकते हैं।"
          );
        }

        saveTicket(guild.id, {
          ...ticket,
          status: "closed",
          closedAt: new Date().toISOString()
        });

        await channel.permissionOverwrites.edit(ticket.ownerId, {
          SendMessages: false
        });

        const embed = new EmbedBuilder()
          .setColor("#E74C3C")
          .setTitle("🔒 Ticket Closed")
          .setDescription("यह Ticket Close कर दिया गया है।");

        await channel.send({ embeds: [embed] });

        return interaction.editReply("🔒 Ticket Close हो गया!");
      }

      if (id === "ticket:reopen") {
        if (!isStaff) {
          return interaction.editReply(
            "❌ केवल Staff Ticket Reopen कर सकते हैं।"
          );
        }

        saveTicket(guild.id, {
          ...ticket,
          status: "open",
          reopenedAt: new Date().toISOString()
        });

        await channel.permissionOverwrites.edit(ticket.ownerId, {
          SendMessages: true
        });

        await channel.send("🔓 Ticket Reopen कर दिया गया!");

        return interaction.editReply("✅ Ticket Reopen हो गया!");
      }
    } catch (error) {
      console.error("Ticket Controls Error:", error);

      return interaction.editReply(
        "❌ Ticket Control करते समय Error आया।"
      ).catch(() => {});
    }
  }
};
