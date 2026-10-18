/** Erro com status HTTP, lançado pelas camadas de service e middlewares. */
class HttpError extends Error {
  /**
   * @param {number} status - Código HTTP (400, 401, 404...).
   * @param {string} message - Mensagem enviada ao cliente.
   */
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
