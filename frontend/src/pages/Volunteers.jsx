import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Field from '../components/Field.jsx';
import { useResource } from '../hooks/useResource.js';

const emptyForm = { name: '', email: '', phone: '' };

/** Lista de voluntários. Somente admin cria, edita e exclui. */
export default function Volunteers() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const volunteers = useResource('/volunteers');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (await volunteers.save(form, editingId)) cancelEdit();
  }

  function startEdit(volunteer) {
    setEditingId(volunteer.id);
    setForm({ name: volunteer.name, email: volunteer.email, phone: volunteer.phone || '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(volunteer) {
    if (window.confirm(`Excluir o voluntário "${volunteer.name}"?`)) {
      await volunteers.remove(volunteer.id);
    }
  }

  return (
    <section>
      <h1>Voluntários</h1>
      {volunteers.error && <p className="alert">{volunteers.error}</p>}

      {isAdmin && (
        <form className="form-grid" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Editar voluntário' : 'Novo voluntário'}</h2>
          <Field label="Nome" name="name" value={form.name} onChange={handleChange} required />
          <Field
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Field label="Telefone" name="phone" value={form.phone} onChange={handleChange} />
          <div className="actions">
            <button className="btn" type="submit">
              {editingId ? 'Salvar alterações' : 'Cadastrar voluntário'}
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
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              {isAdmin && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {volunteers.items.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="muted">
                  Nenhum voluntário cadastrado.
                </td>
              </tr>
            )}
            {volunteers.items.map((volunteer) => (
              <tr key={volunteer.id}>
                <td>{volunteer.name}</td>
                <td>{volunteer.email}</td>
                <td>{volunteer.phone}</td>
                {isAdmin && (
                  <td>
                    <div className="inline">
                      <button className="btn-light" onClick={() => startEdit(volunteer)}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(volunteer)}>
                        Excluir
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
