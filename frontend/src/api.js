const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Faz uma requisição à API enviando o token JWT (se houver).
 * @param {string} method - GET, POST, PUT ou DELETE.
 * @param {string} path - Caminho da rota, ex.: '/events'.
 * @param {object} [body] - Corpo da requisição (JSON).
 * @returns {Promise<any>} Corpo da resposta (null quando 204).
 * @throws {Error} Com a mensagem devolvida pela API.
 */
async function request(method, path, body) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('token');
    window.location.assign('/login');
  }
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};
