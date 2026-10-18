const eventService = require('../services/eventService');
const { parseId } = require('../utils/validators');

/**
 * GET /events: lista os eventos.
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function list(_req, res) {
  res.json(await eventService.list());
}

/**
 * GET /events/:id: busca um evento.
 * @param {import('express').Request} req - Parâmetro de rota: id.
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getOne(req, res) {
  res.json(await eventService.getById(parseId(req.params.id)));
}

/**
 * POST /events: cria um evento.
 * @param {import('express').Request} req - Corpo: dados do evento.
 * @param {import('express').Response} res - Resposta 201 com o evento criado.
 * @returns {Promise<void>}
 */
async function create(req, res) {
  res.status(201).json(await eventService.create(req.body));
}

/**
 * PUT /events/:id: atualiza um evento.
 * @param {import('express').Request} req - Parâmetro: id. Corpo: dados do evento.
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function update(req, res) {
  res.json(await eventService.update(parseId(req.params.id), req.body));
}

/**
 * DELETE /events/:id: exclui um evento.
 * @param {import('express').Request} req - Parâmetro de rota: id.
 * @param {import('express').Response} res - Resposta 204.
 * @returns {Promise<void>}
 */
async function remove(req, res) {
  await eventService.remove(parseId(req.params.id));
  res.status(204).send();
}

/**
 * GET /events/:id/volunteers: lista os voluntários inscritos no evento.
 * @param {import('express').Request} req - Parâmetro de rota: id.
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function listVolunteers(req, res) {
  res.json(await eventService.listVolunteers(parseId(req.params.id)));
}

/**
 * POST /events/:id/volunteers: inscreve um voluntário no evento.
 * @param {import('express').Request} req - Parâmetro: id. Corpo: { volunteer_id }.
 * @param {import('express').Response} res - Resposta 201.
 * @returns {Promise<void>}
 */
async function registerVolunteer(req, res) {
  await eventService.registerVolunteer(parseId(req.params.id), parseId(req.body.volunteer_id));
  res.status(201).json({ message: 'Voluntário inscrito com sucesso' });
}

/**
 * DELETE /events/:id/volunteers/:volunteerId: cancela a inscrição.
 * @param {import('express').Request} req - Parâmetros de rota: id e volunteerId.
 * @param {import('express').Response} res - Resposta 204.
 * @returns {Promise<void>}
 */
async function unregisterVolunteer(req, res) {
  await eventService.unregisterVolunteer(parseId(req.params.id), parseId(req.params.volunteerId));
  res.status(204).send();
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  listVolunteers,
  registerVolunteer,
  unregisterVolunteer,
};
