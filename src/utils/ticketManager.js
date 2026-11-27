
const { getGuild, updateGuild } = require("./database");

function getTicketData(guildId) {
  const guildData = getGuild(guildId);

  return {
    ...guildData,
    ticketConfig: guildData.ticketConfig || {
      enabled: false,
      categoryId: null,
      staffRoleId: null,
      logChannelId: null,
      panelChannelId: null,
      panelTitle: "🎫 Support Tickets",
      panelDescription: "Click a button below to open a support ticket.",
      panelColor: "#5865F2",
      panelFooter: "Wildlord Core Support",
      panelImage: null,
      panelThumbnail: null,
      buttonLabel: "Create Ticket",
      buttonEmoji: "🎫"
    },
    tickets: Array.isArray(guildData.tickets)
      ? guildData.tickets
      : []
  };
}

function saveTicketConfig(guildId, config) {
  const guildData = getGuild(guildId);

  updateGuild(guildId, {
    ...guildData,
    ticketConfig: {
      ...(guildData.ticketConfig || {}),
      ...config
    }
  });

  return getTicketData(guildId).ticketConfig;
}

function saveTicket(guildId, ticket) {
  const guildData = getTicketData(guildId);
  const tickets = guildData.tickets;

  const index = tickets.findIndex(
    item => item.channelId === ticket.channelId
  );

  if (index === -1) {
    tickets.push(ticket);
  } else {
    tickets[index] = {
      ...tickets[index],
      ...ticket
    };
  }

  updateGuild(guildId, {
    ...guildData,
    tickets
  });

  return ticket;
}

function getTicket(guildId, channelId) {
  const guildData = getTicketData(guildId);

  return guildData.tickets.find(
    ticket => ticket.channelId === channelId
  ) || null;
}

function removeTicket(guildId, channelId) {
  const guildData = getTicketData(guildId);

  const tickets = guildData.tickets.filter(
    ticket => ticket.channelId !== channelId
  );

  updateGuild(guildId, {
    ...guildData,
    tickets
  });

  return true;
}

function getUserOpenTicket(guildId, userId) {
  const guildData = getTicketData(guildId);

  return guildData.tickets.find(
    ticket =>
      ticket.ownerId === userId &&
      ticket.status === "open"
  ) || null;
}

module.exports = {
  getTicketData,
  saveTicketConfig,
  saveTicket,
  getTicket,
  removeTicket,
  getUserOpenTicket
};
