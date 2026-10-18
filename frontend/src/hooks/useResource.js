import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * Hook de CRUD para um recurso REST (/events, /volunteers...).
 * @param {string} path - Caminho base do recurso.
 * @returns {{items: object[], error: string, setError: Function, reload: Function, save: Function, remove: Function}}
 */
export function useResource(path) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await api.get(path));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  /** Cria (sem id) ou atualiza (com id). Retorna true se deu certo. */
  async function save(data, id) {
    try {
      if (id) await api.put(`${path}/${id}`, data);
      else await api.post(path, data);
      await load();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function remove(id) {
    try {
      await api.del(`${path}/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return { items, error, setError, reload: load, save, remove };
}
