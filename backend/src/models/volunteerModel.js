const db = require('../config/db');

/** @returns {Promise<object[]>} Todos os voluntários. */
async function findAll() {
  const [rows] = await db.query('SELECT * FROM volunteers ORDER BY name');
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|undefined>}
 */
async function findById(id) {
  const [rows] = await db.query('SELECT * FROM volunteers WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Lista os voluntários inscritos em um evento.
 * @param {number} eventId
 * @returns {Promise<object[]>}
 */
async function findByEvent(eventId) {
  const [rows] = await db.query(
    `SELECT v.* FROM volunteers v
     JOIN event_volunteers ev ON ev.volunteer_id = v.id
     WHERE ev.event_id = ?
     ORDER BY v.name`,
    [eventId],
  );
  return rows;
}

/**
 * @param {{name: string, email: string, phone: ?string}} data
 * @returns {Promise<object>} O voluntário criado.
 */
async function create({ name, email, phone }) {
  const [result] = await db.query('INSERT INTO volunteers (name, email, phone) VALUES (?, ?, ?)', [
    name,
    email,
    phone,
  ]);
  return findById(result.insertId);
}

/**
 * @param {number} id
 * @param {{name: string, email: string, phone: ?string}} data
 * @returns {Promise<object>} O voluntário atualizado.
 */
async function update(id, { name, email, phone }) {
  await db.query('UPDATE volunteers SET name = ?, email = ?, phone = ? WHERE id = ?', [
    name,
    email,
    phone,
    id,
  ]);
  return findById(id);
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} true se removeu.
 */
async function remove(id) {
  const [result] = await db.query('DELETE FROM volunteers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByEvent, create, update, remove };
