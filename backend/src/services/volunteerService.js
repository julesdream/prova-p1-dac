const volunteerModel = require('../models/volunteerModel');
const HttpError = require('../utils/HttpError');
const { cleanText, isValidEmail } = require('../utils/validators');

/**
 * Valida e normaliza os dados de um voluntário.
 * @param {object} data - Corpo da requisição.
 * @returns {{name: string, email: string, phone: ?string}}
 * @throws {HttpError} 400 se algum campo for inválido.
 */
function normalize(data) {
  const name = cleanText(data.name);
  const email = cleanText(data.email);

  if (!name) throw new HttpError(400, 'name é obrigatório');
  if (!isValidEmail(email)) throw new HttpError(400, 'email inválido');

  return { name, email, phone: cleanText(data.phone) || null };
}

/**
 * @param {number} id
 * @returns {Promise<object>}
 * @throws {HttpError} 404
 */
async function getById(id) {
  const volunteer = await volunteerModel.findById(id);
  if (!volunteer) throw new HttpError(404, 'Voluntário não encontrado');
  return volunteer;
}

/** @returns {Promise<object[]>} */
function list() {
  return volunteerModel.findAll();
}

/**
 * @param {object} data
 * @returns {Promise<object>}
 * @throws {HttpError} 400
 */
function create(data) {
  return volunteerModel.create(normalize(data));
}

/**
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object>}
 * @throws {HttpError} 400 dados inválidos, 404 não encontrado.
 */
async function update(id, data) {
  await getById(id);
  return volunteerModel.update(id, normalize(data));
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 * @throws {HttpError} 404
 */
async function remove(id) {
  await getById(id);
  await volunteerModel.remove(id);
}

module.exports = { list, getById, create, update, remove };
