import { NavLink, Link, useNavigate } from 'react-router-dom';
import { getStoredToken, logout } from '../auth/tokenStore.js';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const stored   = getStoredToken();
  const role     = stored?.role;
  const name     = stored?.name || role || '';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh' }}>
      <nav className="navbar">
        <Link to="/products" className="navbar-brand">
          ◎ Nexus<span className="dot"></span>
        </Link>

        <div className="navbar-nav">
          {stored?.token && <NavLink to="/products" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Products</NavLink>}
          {role === 'Buyer'  && <NavLink to="/orders"         className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>My Orders</NavLink>}
          {role === 'Vendor' && <NavLink to="/vendor/products" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>My Products</NavLink>}
          {role === 'Vendor' && <NavLink to="/vendor/orders"   className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Orders</NavLink>}
          {role === 'Admin'  && <NavLink to="/admin"           className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Admin</NavLink>}
        </div>

        <div className="navbar-end">
          {stored?.token ? (
            <>
              <div className="user-chip">
                <span>{name}</span>
                <span className="role">· {role}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth/login"    className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/auth/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      <main className="page-wrap" style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
