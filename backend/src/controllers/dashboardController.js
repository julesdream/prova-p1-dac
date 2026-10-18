const dashboardService = require('../services/dashboardService');

/**
 * GET /dashboard: resumo para o usuário autenticado.
 * @param {import('express').Request} req - Usa req.user (payload do token).
 * @param {import('express').Response} res - Resposta 200 com o resumo.
 * @returns {Promise<void>}
 */
async function show(req, res) {
  res.json(await dashboardService.getSummary(req.user));
}

module.exports = { show };
