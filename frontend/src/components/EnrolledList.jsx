import { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Lista os voluntários inscritos em um evento (GET /events/:id/volunteers).
 * @param {{eventId: number, version: number, canRemove: boolean, onRemove: Function}} props
 * `version` muda quando o total de inscritos muda, o que recarrega a lista.
 */
export default function EnrolledList({ eventId, version, canRemove, onRemove }) {
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/events/${eventId}/volunteers`)
      .then(setVolunteers)
      .catch((err) => setError(err.message));
  }, [eventId, version]);

  if (error) return <p className="alert">{error}</p>;
  if (volunteers.length === 0) return <p className="muted">Nenhum voluntário inscrito ainda.</p>;

  return (
    <ul className="enrolled">
      {volunteers.map((volunteer) => (
        <li key={volunteer.id}>
          <span>
            {volunteer.name} <span className="muted">({volunteer.email})</span>
          </span>
          {canRemove && (
            <button className="btn-danger" onClick={() => onRemove(eventId, volunteer)}>
              Remover
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
