const db = require('../config/db');

const SELECT_WITH_ENROLLED = `
  SELECT e.*, COUNT(ev.volunteer_id) AS enrolled
  FROM events e
  LEFT JOIN event_volunteers ev ON ev.event_id = e.id`;

/** @returns {Promise<object[]>} Todos os eventos (com o total de inscritos), ordenados por data. */
async function findAll() {
  const [rows] = await db.query(`${SELECT_WITH_ENROLLED} GROUP BY e.id ORDER BY e.event_date`);
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|undefined>} O evento (com o total de inscritos) ou undefined.
 */
async function findById(id) {
  const [rows] = await db.query(`${SELECT_WITH_ENROLLED} WHERE e.id = ? GROUP BY e.id`, [id]);
  return rows[0];
}

/**
 * Insere um evento.
 * @param {{title: string, description: ?string, event_date: string, location: string, max_volunteers: number}} data
 * @returns {Promise<object>} O evento criado.
 */
async function create({ title, description, event_date, location, max_volunteers }) {
  const [result] = await db.query(
    'INSERT INTO events (title, description, event_date, location, max_volunteers) VALUES (?, ?, ?, ?, ?)',
    [title, description, event_date, location, max_volunteers],
  );
  return findById(result.insertId);
}

/**
 * Atualiza um evento.
 * @param {number} id
 * @param {{title: string, description: ?string, event_date: string, location: string, max_volunteers: number}} data
 * @returns {Promise<object>} O evento atualizado.
 */
async function update(id, { title, description, event_date, location, max_volunteers }) {
  await db.query(
    'UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_volunteers = ? WHERE id = ?',
    [title, description, event_date, location, max_volunteers, id],
  );
  return findById(id);
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} true se algum registro foi removido.
 */
async function remove(id) {
  const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Inscreve um voluntário em um evento.
 * @param {number} eventId
 * @param {number} volunteerId
 */
async function addVolunteer(eventId, volunteerId) {
  await db.query('INSERT INTO event_volunteers (event_id, volunteer_id) VALUES (?, ?)', [
    eventId,
    volunteerId,
  ]);
}

/**
 * Cancela a inscrição de um voluntário em um evento.
 * @param {number} eventId
 * @param {number} volunteerId
 * @returns {Promise<boolean>} true se a inscrição existia e foi removida.
 */
async function removeVolunteer(eventId, volunteerId) {
  const [result] = await db.query(
    'DELETE FROM event_volunteers WHERE event_id = ? AND volunteer_id = ?',
    [eventId, volunteerId],
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove, addVolunteer, removeVolunteer };
