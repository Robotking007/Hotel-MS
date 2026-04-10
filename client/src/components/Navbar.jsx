import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="icon">🍽️</span>
          <span className="text-gradient-2">QuickServe</span>
        </Link>

        <div className="navbar-links">
          <Link to="/menu" className={`navbar-link ${isActive('/menu')}`}>Menu</Link>
          {isAuth && user?.role === 'customer' && (
            <Link to="/orders" className={`navbar-link ${isActive('/orders')}`}>My Orders</Link>
          )}
          {isAuth && (user?.role === 'staff' || user?.role === 'admin') && (
            <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>Dashboard</Link>
          )}
          {isAuth && user?.role === 'admin' && (
            <>
              <Link to="/admin/menu" className={`navbar-link ${isActive('/admin/menu')}`}>Manage Menu</Link>
              <Link to="/admin/analytics" className={`navbar-link ${isActive('/admin/analytics')}`}>Analytics</Link>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isAuth && user?.role === 'customer' && (
            <Link to="/cart" className="cart-badge" id="cart-icon">
              🛒 Cart
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </Link>
          )}

          {isAuth ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)} id="user-menu-btn">
                <span className="user-avatar">{user.name?.charAt(0)}</span>
                <span>{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.7rem' }}>▾</span>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {user.email}
                    <div className="badge badge-category" style={{ marginLeft: 6, display: 'inline' }}>{user.role}</div>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role === 'admin' && (
                    <Link to="/admin/settings">⚙️ Settings</Link>
                  )}
                  <button onClick={handleLogout} style={{ color: 'var(--error)' }}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/menu" className={`navbar-link ${isActive('/menu')}`}>Menu</Link>
        {isAuth && user?.role === 'customer' && (
          <>
            <Link to="/cart" className={`navbar-link ${isActive('/cart')}`}>🛒 Cart {itemCount > 0 && `(${itemCount})`}</Link>
            <Link to="/orders" className={`navbar-link ${isActive('/orders')}`}>My Orders</Link>
          </>
        )}
        {isAuth && (user?.role === 'staff' || user?.role === 'admin') && (
          <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>Dashboard</Link>
        )}
        {isAuth && user?.role === 'admin' && (
          <>
            <Link to="/admin/menu" className={`navbar-link ${isActive('/admin/menu')}`}>Manage Menu</Link>
            <Link to="/admin/analytics" className={`navbar-link ${isActive('/admin/analytics')}`}>Analytics</Link>
            <Link to="/admin/settings" className={`navbar-link ${isActive('/admin/settings')}`}>Settings</Link>
          </>
        )}
        {!isAuth && (
          <>
            <Link to="/login" className="navbar-link">Sign In</Link>
            <Link to="/register" className="navbar-link">Get Started</Link>
          </>
        )}
        {isAuth && (
          <button className="navbar-link" onClick={handleLogout} style={{ color: 'var(--error)', textAlign: 'left' }}>Sign Out</button>
        )}
      </div>
    </nav>
  );
}
