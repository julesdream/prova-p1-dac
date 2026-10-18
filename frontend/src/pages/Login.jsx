import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Field from '../components/Field.jsx';

/** Tela de login (POST /auth/login). */
export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Voluntariado IFRS</h1>
        <p className="muted">Entre para gerenciar eventos e voluntários.</p>
        <Field
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Field
          label="Senha"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <p className="alert">{error}</p>}
        <button className="btn" type="submit">
          Entrar
        </button>
        <p className="muted hint">
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
        <p className="muted hint">Teste: admin@ifrs.edu.br / 123456</p>
      </form>
    </div>
  );
}
