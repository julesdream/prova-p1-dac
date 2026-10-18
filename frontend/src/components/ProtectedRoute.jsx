import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

/** Redireciona para /login quando não há usuário autenticado. */
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
