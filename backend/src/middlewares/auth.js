const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');

/**
 * Exige um token JWT válido no header Authorization: Bearer <token>.
 * Coloca o payload do token em req.user.
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 * @throws {HttpError} 401 se o token estiver ausente, inválido ou expirado.
 */
function authenticate(req, _res, next) {
  const [, token] = (req.headers.authorization || '').split(' ');
  if (!token) throw new HttpError(401, 'Token não informado');

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Token inválido ou expirado');
  }
  next();
}

/**
 * Libera a rota apenas para as roles informadas.
 * @param {...string} roles - Ex.: authorize('admin')
 * @returns {import('express').RequestHandler}
 * @throws {HttpError} 403 se a role do usuário não estiver na lista.
 */
function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw new HttpError(403, 'Acesso negado');
    next();
  };
}

module.exports = { authenticate, authorize };
