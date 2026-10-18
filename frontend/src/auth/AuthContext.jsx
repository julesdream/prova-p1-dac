import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

/**
 * Lê o payload do JWT. Retorna null se o token for inválido ou estiver expirado.
 * @param {string} token
 * @returns {{email: string, role: string, exp: number}|null}
 */
function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp * 1000 > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

/** Guarda o token e o usuário logado e expõe login/logout para a aplicação. */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

/** @returns {{user: object|null, login: Function, logout: Function}} */
export function useAuth() {
  return useContext(AuthContext);
}
