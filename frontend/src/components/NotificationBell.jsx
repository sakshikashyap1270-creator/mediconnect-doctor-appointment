import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read && !n.isRead).length);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      fetchNotifications();
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn-icon" 
        onClick={() => setShowDropdown(!showDropdown)} 
        title="View Notifications"
      >
        <span>🔔</span>
        {unreadCount > 0 && <div className="badge-dot" />}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '45px',
          right: 0,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ padding: '2px 8px', fontSize: '0.75rem' }} 
                onClick={handleMarkAllRead}
              >
                Mark Read
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                No notifications
              </p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: n.is_read || n.isRead ? 'transparent' : 'var(--primary-light)',
                    fontSize: '0.85rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <p style={{ margin: 0, color: 'var(--text-main)' }}>{n.message}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(n.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
