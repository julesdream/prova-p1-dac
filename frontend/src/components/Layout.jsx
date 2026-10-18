import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

/** Cabeçalho com navegação + área onde as páginas são renderizadas. */
export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <strong className="brand">Voluntariado IFRS</strong>
        <nav>
          <NavLink to="/" end>
            Início
          </NavLink>
          <NavLink to="/events">Eventos</NavLink>
          <NavLink to="/volunteers">Voluntários</NavLink>
        </nav>
        <div className="session">
          <span>
            {user.email} ({user.role})
          </span>
          <button className="btn-light" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
