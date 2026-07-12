import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import ChatWidget from './ChatWidget.jsx';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeChatUser, setActiveChatUser] = useState(null);

  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
  };

  // Helper to open chat widget globally
  window.openGlobalChat = (otherUser) => {
    setActiveChatUser(otherUser);
  };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'patient') {
      return [
        { path: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/patient/appointments', label: 'Appointments', icon: '📅' },
        { path: '/patient/records', label: 'Medical Records', icon: '📁' },
        { path: '/patient/profile', label: 'My Profile', icon: '👤' },
      ];
    } else if (user.role === 'doctor') {
      return [
        { path: '/doctor/dashboard', label: 'Dashboard', icon: '🩺' },
        { path: '/doctor/availability', label: 'Availability', icon: '⏰' },
        { path: '/doctor/profile', label: 'Edit Profile', icon: '👤' },
      ];
    } else if (user.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '🔑' },
        { path: '/admin/doctors', label: 'Verify Doctors', icon: '👨‍⚕️' },
        { path: '/admin/patients', label: 'Manage Patients', icon: '👥' },
        { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
        { path: '/admin/cms', label: 'CMS Config', icon: '⚙️' },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: '260px', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-light)' }}>
        <div className="sidebar-header" style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" className="sidebar-logo" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            🩺 MediConnect
          </Link>
        </div>
        <ul className="sidebar-nav" style={{ padding: '24px 16px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {links.map(l => {
            const isActive = location.pathname === l.path;
            return (
              <li key={l.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Link to={l.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: isActive ? '#fff' : '#94a3b8' }}>
                  <span>{l.icon}</span> {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {user && (
            <div className="user-profile-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar" style={{ minWidth: '40px' }}>
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name" style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                <span className="user-role" style={{ color: '#64748b', fontSize: '0.75rem' }}>{user.role.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 32px', height: '70px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
          <div className="header-search">
            <span>🔍</span>
            <input type="text" placeholder="Search appointments, clinics..." />
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Light/Dark Theme">
              🌓
            </button>
            <NotificationBell />
            {user ? (
              <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </header>

        <main className="page-content" style={{ flexGrow: 1, padding: '32px' }}>
          <Outlet />
        </main>
      </div>

      {/* Global chat widget */}
      {activeChatUser && (
        <ChatWidget 
          activeChatUser={activeChatUser} 
          onClose={() => setActiveChatUser(null)} 
        />
      )}
    </div>
  );
};

export default Layout;
