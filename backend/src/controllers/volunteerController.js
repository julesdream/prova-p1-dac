const volunteerService = require('../services/volunteerService');
const { parseId } = require('../utils/validators');

/**
 * GET /volunteers: lista os voluntários.
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function list(_req, res) {
  res.json(await volunteerService.list());
}

/**
 * GET /volunteers/:id: busca um voluntário.
 * @param {import('express').Request} req - Parâmetro de rota: id.
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getOne(req, res) {
  res.json(await volunteerService.getById(parseId(req.params.id)));
}

/**
 * POST /volunteers: cadastra um voluntário.
 * @param {import('express').Request} req - Corpo: { name, email, phone }.
 * @param {import('express').Response} res - Resposta 201 com o voluntário criado.
 * @returns {Promise<void>}
 */
async function create(req, res) {
  res.status(201).json(await volunteerService.create(req.body));
}

/**
 * PUT /volunteers/:id: atualiza um voluntário.
 * @param {import('express').Request} req - Parâmetro: id. Corpo: { name, email, phone }.
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function update(req, res) {
  res.json(await volunteerService.update(parseId(req.params.id), req.body));
}

/**
 * DELETE /volunteers/:id: exclui um voluntário.
 * @param {import('express').Request} req - Parâmetro de rota: id.
 * @param {import('express').Response} res - Resposta 204.
 * @returns {Promise<void>}
 */
async function remove(req, res) {
  await volunteerService.remove(parseId(req.params.id));
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };
