const authService = require('../services/authService');

/**
 * POST /auth/login: autentica o usuário e devolve o token JWT.
 * @param {import('express').Request} req - Corpo: { email, password }.
 * @param {import('express').Response} res - Resposta 200 com { token }.
 * @returns {Promise<void>}
 */
async function login(req, res) {
  const { email, password } = req.body;
  res.json(await authService.login(email, password));
}

/**
 * POST /auth/register: cadastra um usuário comum.
 * @param {import('express').Request} req - Corpo: { email, password }.
 * @param {import('express').Response} res - Resposta 201 com o usuário criado.
 * @returns {Promise<void>}
 */
async function register(req, res) {
  const { email, password } = req.body;
  res.status(201).json(await authService.register(email, password));
}

module.exports = { login, register };
