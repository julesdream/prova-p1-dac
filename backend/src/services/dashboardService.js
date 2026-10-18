const eventService = require('./eventService');
const volunteerService = require('./volunteerService');

/**
 * Monta o resumo exibido no dashboard.
 * @param {{email: string, role: string}} user - Payload do token.
 * @returns {Promise<object>}
 */
async function getSummary(user) {
  const [events, volunteers] = await Promise.all([eventService.list(), volunteerService.list()]);
  return {
    message: `Bem-vindo, ${user.email}`,
    role: user.role,
    totalEvents: events.length,
    totalVolunteers: volunteers.length,
  };
}

module.exports = { getSummary };
