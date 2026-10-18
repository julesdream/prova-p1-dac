/**
 * Middleware global de erros: transforma qualquer erro em resposta JSON.
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, _req, res, _next) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Registro já existe' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido no corpo da requisição' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Erro interno do servidor' : err.message });
}

module.exports = errorHandler;
