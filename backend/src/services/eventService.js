const eventModel = require('../models/eventModel');
const volunteerModel = require('../models/volunteerModel');
const HttpError = require('../utils/HttpError');
const { cleanText, isValidDate } = require('../utils/validators');

const DEFAULT_MAX_VOLUNTEERS = 10;

/**
 * Valida e normaliza os dados de um evento.
 * @param {object} data - Corpo da requisição.
 * @returns {{title: string, description: ?string, event_date: string, location: string, max_volunteers: number}}
 * @throws {HttpError} 400 se algum campo for inválido.
 */
function normalize(data) {
  const title = cleanText(data.title);
  const location = cleanText(data.location);
  const maxVolunteers = data.max_volunteers ?? DEFAULT_MAX_VOLUNTEERS;

  if (!title || !location) throw new HttpError(400, 'title e location são obrigatórios');
  if (!isValidDate(data.event_date)) {
    throw new HttpError(400, 'event_date deve ser uma data válida no formato AAAA-MM-DD');
  }
  if (!Number.isInteger(maxVolunteers) || maxVolunteers < 1) {
    throw new HttpError(400, 'max_volunteers deve ser um inteiro maior que zero');
  }

  return {
    title,
    description: cleanText(data.description) || null,
    event_date: data.event_date,
    location,
    max_volunteers: maxVolunteers,
  };
}

/**
 * Busca um evento ou lança 404.
 * @param {number} id
 * @returns {Promise<object>}
 * @throws {HttpError} 404
 */
async function getById(id) {
  const event = await eventModel.findById(id);
  if (!event) throw new HttpError(404, 'Evento não encontrado');
  return event;
}

/** @returns {Promise<object[]>} */
function list() {
  return eventModel.findAll();
}

/**
 * @param {object} data
 * @returns {Promise<object>}
 * @throws {HttpError} 400
 */
function create(data) {
  return eventModel.create(normalize(data));
}

/**
 * Atualiza um evento. Não permite reduzir o limite abaixo do total de inscritos.
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object>}
 * @throws {HttpError} 400 dados inválidos, 404 não encontrado, 409 limite menor que os inscritos.
 */
async function update(id, data) {
  const event = await getById(id);
  const newData = normalize(data);

  if (newData.max_volunteers < event.enrolled) {
    throw new HttpError(409, `Já existem ${event.enrolled} voluntários inscritos neste evento`);
  }
  return eventModel.update(id, newData);
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 * @throws {HttpError} 404
 */
async function remove(id) {
  await getById(id);
  await eventModel.remove(id);
}

/**
 * Lista os voluntários inscritos em um evento.
 * @param {number} eventId
 * @returns {Promise<object[]>}
 * @throws {HttpError} 404 se o evento não existir.
 */
async function listVolunteers(eventId) {
  await getById(eventId);
  return volunteerModel.findByEvent(eventId);
}

/**
 * Inscreve um voluntário respeitando o limite máximo do evento.
 * @param {number} eventId
 * @param {number} volunteerId
 * @throws {HttpError} 404 se evento/voluntário não existir; 409 se o evento estiver lotado
 * ou o voluntário já estiver inscrito.
 */
async function registerVolunteer(eventId, volunteerId) {
  const event = await getById(eventId);

  const volunteer = await volunteerModel.findById(volunteerId);
  if (!volunteer) throw new HttpError(404, 'Voluntário não encontrado');

  if (event.enrolled >= event.max_volunteers) throw new HttpError(409, 'Evento lotado');

  try {
    await eventModel.addVolunteer(eventId, volunteerId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Voluntário já inscrito neste evento');
    }
    throw err;
  }
}

/**
 * Cancela a inscrição de um voluntário em um evento.
 * @param {number} eventId
 * @param {number} volunteerId
 * @throws {HttpError} 404 se o evento ou a inscrição não existir.
 */
async function unregisterVolunteer(eventId, volunteerId) {
  await getById(eventId);
  const removed = await eventModel.removeVolunteer(eventId, volunteerId);
  if (!removed) throw new HttpError(404, 'Inscrição não encontrada');
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listVolunteers,
  registerVolunteer,
  unregisterVolunteer,
};
