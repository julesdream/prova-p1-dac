const HttpError = require('./HttpError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Converte um parâmetro de rota em id numérico.
 * @param {string|number} value
 * @returns {number}
 * @throws {HttpError} 400 se não for um inteiro positivo.
 */
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'id inválido');
  return id;
}

/**
 * @param {unknown} value
 * @returns {boolean} true se for um e-mail em formato válido.
 */
function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value);
}

/**
 * @param {unknown} value
 * @returns {boolean} true se for uma data real no formato AAAA-MM-DD.
 */
function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/**
 * Remove espaços das pontas de um texto; devolve '' se não for texto.
 * @param {unknown} value
 * @returns {string}
 */
function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

module.exports = { parseId, isValidEmail, isValidDate, cleanText };
