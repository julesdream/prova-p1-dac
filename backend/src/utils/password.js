const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Gera o hash de uma senha usando scrypt (nativo do Node) com salt aleatório.
 * @param {string} password - Senha em texto puro.
 * @returns {Promise<string>} Texto no formato "salt:hash" (ambos em hexadecimal).
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${hash.toString('hex')}`;
}

/**
 * Confere se a senha informada corresponde ao hash armazenado.
 * @param {string} password - Senha em texto puro.
 * @param {string} stored - Valor guardado no banco ("salt:hash").
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  if (expected.length === 0) return false;

  const actual = await scryptAsync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };
