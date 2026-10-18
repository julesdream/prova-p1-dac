import { useEffect, useState } from 'react';
import { api } from '../api.js';

/** Tela inicial: consome a rota protegida GET /dashboard. */
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!summary) return <p className="muted">Carregando...</p>;

  return (
    <section>
      <h1>{summary.message}</h1>
      <p className="muted">Seu perfil de acesso: {summary.role}</p>
      <dl className="totals">
        <div>
          <dt>Eventos cadastrados</dt>
          <dd>{summary.totalEvents}</dd>
        </div>
        <div>
          <dt>Voluntários cadastrados</dt>
          <dd>{summary.totalVolunteers}</dd>
        </div>
      </dl>
    </section>
  );
}
