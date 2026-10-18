const db = require('../config/db');

/**
 * Busca um usuário pelo e-mail.
 * @param {string} email
 * @returns {Promise<{id: number, email: string, password: string, role: string}|undefined>}
 */
async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

/**
 * Insere um usuário (a senha já deve vir com hash).
 * @param {{email: string, password: string, role?: string}} data
 * @returns {Promise<{id: number, email: string, role: string}>} Usuário criado, sem a senha.
 */
async function create({ email, password, role = 'user' }) {
  const [result] = await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
    email,
    password,
    role,
  ]);
  return { id: result.insertId, email, role };
}

module.exports = { findByEmail, create };
