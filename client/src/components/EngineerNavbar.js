import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './EngineerNavbar.css';

const EngineerNavbar = () => {
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem('user')) || {};

  const navItems = [
    { label: 'Dashboard', path: '/engineer'      },
    { label: 'My Jobs',   path: '/engineer/jobs' }
  ];

  return (
    <nav className="admin-navbar">
      <div className="admin-left">
        <div className="admin-logo">🔧 Engineer Panel</div>
        <div className="admin-user-info">
          Logged in as: <strong>{user.name || user.email || 'Engineer'}</strong>
        </div>
      </div>

      <ul className="admin-nav-links">
        {navItems.map(({ label, path }) => (
          <li key={path} className={location.pathname === path ? 'active' : ''}>
            <Link to={path}>{label}</Link>
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

export default EngineerNavbar;
