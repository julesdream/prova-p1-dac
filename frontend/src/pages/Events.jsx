import { Fragment, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import EnrolledList from '../components/EnrolledList.jsx';
import Field from '../components/Field.jsx';
import { useResource } from '../hooks/useResource.js';

const emptyForm = { title: '', description: '', event_date: '', location: '', max_volunteers: 10 };

/** Lista de eventos. Admin cria/edita/exclui; qualquer usuário inscreve voluntários. */
export default function Events() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const events = useResource('/events');
  const volunteers = useResource('/volunteers');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [chosen, setChosen] = useState({});
  const [openId, setOpenId] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, max_volunteers: Number(form.max_volunteers) };
    if (await events.save(payload, editingId)) cancelEdit();
  }

  function startEdit(event) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      location: event.location,
      max_volunteers: event.max_volunteers,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(event) {
    if (window.confirm(`Excluir o evento "${event.title}"?`)) await events.remove(event.id);
  }

  /** Executa uma chamada de inscrição, mostra o resultado e recarrega os totais. */
  async function runEnrollment(request, successMessage) {
    try {
      await request();
      events.setError('');
      setMessage(successMessage);
      await events.reload();
    } catch (err) {
      setMessage('');
      events.setError(err.message);
    }
  }

  function registerVolunteer(eventId) {
    if (!chosen[eventId]) return;
    runEnrollment(
      () => api.post(`/events/${eventId}/volunteers`, { volunteer_id: Number(chosen[eventId]) }),
      'Voluntário inscrito com sucesso',
    );
  }

  function unregisterVolunteer(eventId, volunteer) {
    if (!window.confirm(`Remover ${volunteer.name} deste evento?`)) return;
    runEnrollment(
      () => api.del(`/events/${eventId}/volunteers/${volunteer.id}`),
      'Inscrição cancelada',
    );
  }

  return (
    <section>
      <h1>Eventos</h1>
      {events.error && <p className="alert">{events.error}</p>}
      {message && <p className="success">{message}</p>}

      {isAdmin && (
        <form className="form-grid" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar evento' : 'Novo evento'}</h2>
          <Field label="Título" name="title" value={form.title} onChange={handleChange} required />
          <Field
            label="Descrição"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
          <Field
            label="Data"
            name="event_date"
            type="date"
            value={form.event_date}
            onChange={handleChange}
            required
          />
          <Field
            label="Local"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
          <Field
            label="Máximo de voluntários"
            name="max_volunteers"
            type="number"
            min="1"
            value={form.max_volunteers}
            onChange={handleChange}
            required
          />
          <div className="actions">
            <button className="btn" type="submit">
              {editingId ? 'Salvar alterações' : 'Criar evento'}
            </button>
            {editingId && (
              <button className="btn-light" type="button" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Data</th>
              <th>Local</th>
              <th>Vagas</th>
              <th>Inscrever voluntário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Nenhum evento cadastrado.
                </td>
              </tr>
            )}
            {events.items.map((event) => (
              <Fragment key={event.id}>
                <tr>
                  <td>
                    <strong>{event.title}</strong>
                    <br />
                    <span className="muted">{event.description}</span>
                  </td>
                  <td>{event.event_date}</td>
                  <td>{event.location}</td>
                  <td>
                    {event.enrolled}/{event.max_volunteers}
                    {event.enrolled >= event.max_volunteers && <span className="tag">Lotado</span>}
                  </td>
                  <td>
                    <div className="inline">
                      <select
                        aria-label={`Voluntário para ${event.title}`}
                        value={chosen[event.id] || ''}
                        onChange={(e) => setChosen({ ...chosen, [event.id]: e.target.value })}
                      >
                        <option value="">Escolha...</option>
                        {volunteers.items.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <button className="btn-light" onClick={() => registerVolunteer(event.id)}>
                        Inscrever
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="inline">
                      <button
                        className="btn-light"
                        onClick={() => setOpenId(openId === event.id ? null : event.id)}
                      >
                        {openId === event.id ? 'Ocultar inscritos' : 'Ver inscritos'}
                      </button>
                      {isAdmin && (
                        <>
                          <button className="btn-light" onClick={() => startEdit(event)}>
                            Editar
                          </button>
                          <button className="btn-danger" onClick={() => handleDelete(event)}>
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {openId === event.id && (
                  <tr>
                    <td colSpan={6} className="enrolled-row">
                      <EnrolledList
                        eventId={event.id}
                        version={event.enrolled}
                        canRemove={isAdmin}
                        onRemove={unregisterVolunteer}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
