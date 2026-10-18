const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const HttpError = require('../utils/HttpError');
const { hashPassword, verifyPassword } = require('../utils/password');
const { isValidEmail } = require('../utils/validators');

const MIN_PASSWORD_LENGTH = 6;

/**
 * Valida as credenciais e gera um token JWT com payload { email, role }.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string}>}
 * @throws {HttpError} 400 se faltar dado, 401 se credenciais inválidas.
 */
async function login(email, password) {
  if (!email || !password) throw new HttpError(400, 'email e password são obrigatórios');

  const user = await userModel.findByEmail(email);
  const passwordMatches = user && (await verifyPassword(password, user.password));
  if (!passwordMatches) throw new HttpError(401, 'Credenciais inválidas');

  const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return { token };
}

/**
 * Cadastra um novo usuário comum (role sempre "user"), guardando a senha com hash.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{id: number, email: string, role: string}>}
 * @throws {HttpError} 400 se os dados forem inválidos, 409 se o e-mail já existir.
 */
async function register(email, password) {
  if (!isValidEmail(email)) throw new HttpError(400, 'email inválido');
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `password deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  if (await userModel.findByEmail(email)) throw new HttpError(409, 'E-mail já cadastrado');

  return userModel.create({ email, password: await hashPassword(password), role: 'user' });
}

module.exports = { login, register };
