import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('user'));
  //const [serverOnline, setServerOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  if (!token) return;

  axios.get('/api/admin/tickets', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      const pending = res.data.filter(ticket => !ticket.adminReply).length;
      setPendingCount(pending);
    })
    .catch((err) => {
      console.error("Failed to fetch tickets:", err);
      setPendingCount(0);
    });
}, []);

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Connections', path: '/admin/connections' },
    { label: 'Helpdesk', path: '/admin/helpdesk', badge: pendingCount },
    { label: 'KYC', path: '/admin/kyc-review' },

  ];

  return (
    <nav className="admin-navbar">
      <div className="admin-left">
        <div className="admin-logo">⚡ Admin Panel</div>
        <div className="admin-user-info">
          <span>Logged in as:</span> <strong>{userData?.email || 'Admin'}</strong>
        </div>
        
       {/* <div className={`server-status ${serverOnline ? 'online' : 'offline'}`}>
          {serverOnline ? '🟢 Server Online' : '🔴 Server Offline'}
        </div> */}
 
        </div>

      <ul className="admin-nav-links">
        {navItems.map(({ label, path, badge }) => (
          <li key={path} className={location.pathname === path ? 'active' : ''}>
            <Link to={path}>
              {label}
              {badge > 0 && <span className="badge">{badge}</span>}
            </Link>
          </li>
        ))}
        <li>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;