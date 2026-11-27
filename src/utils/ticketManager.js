
const { getGuild, updateGuild } = require("./database");

const DEFAULT_CONFIG = {
  enabled: false,
  categoryId: null,
  staffRoleId: null,
  logChannelId: null,
  panelChannelId: null,
  feedbackChannelId: null,
  panelTitle: "🎫 Support Tickets",
  panelDescription: "Click a button below to open a support ticket.",
  panelColor: "#5865F2",
  panelFooter: "Wildlord Core Support",
  panelImage: null,
  panelThumbnail: null,
  buttonLabel: "Create Ticket",
  buttonEmoji: "🎫"
};

function getTicketData(guildId) {
  const guildData = getGuild(guildId);

  return {
    ticketConfig: {
      ...DEFAULT_CONFIG,
      ...(guildData.ticketConfig || {})
    },
    tickets: Array.isArray(guildData.tickets)
      ? guildData.tickets
      : []
  };
}

function saveTicketConfig(guildId, config) {
  const guildData = getGuild(guildId);

  const ticketConfig = {
    ...DEFAULT_CONFIG,
    ...(guildData.ticketConfig || {}),
    ...config
  };

  updateGuild(guildId, { ticketConfig });

  return ticketConfig;
}

function saveTicket(guildId, ticket) {
  const guildData = getGuild(guildId);
  const tickets = Array.isArray(guildData.tickets)
    ? [...guildData.tickets]
    : [];

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

  updateGuild(guildId, { tickets });

  return ticket;
}

function getTicket(guildId, channelId) {
  return getTicketData(guildId).tickets.find(
    ticket => ticket.channelId === channelId
  ) || null;
}

function removeTicket(guildId, channelId) {
  const guildData = getGuild(guildId);

  const tickets = (Array.isArray(guildData.tickets)
    ? guildData.tickets
    : []
  ).filter(ticket => ticket.channelId !== channelId);

  updateGuild(guildId, { tickets });

  return true;
}

function getUserOpenTicket(guildId, userId) {
  return getTicketData(guildId).tickets.find(
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
