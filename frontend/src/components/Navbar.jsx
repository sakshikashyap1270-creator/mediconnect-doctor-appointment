import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
  };

  return (
    <header className="main-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800 }}>🩺 MediConnect</h3>
      </div>

      <div className="header-actions">
        {user ? (
          <>
            <NotificationBell />
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">🌓</button>
            <div className="user-profile-card">
              <div className="avatar">{user.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role.toUpperCase()}</span>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn-icon" onClick={toggleTheme}>🌓</button>
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
