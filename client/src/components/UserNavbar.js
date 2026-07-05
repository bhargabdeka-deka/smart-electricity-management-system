import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useLifecycle } from '../hooks/useLifecycle';
import { Menu, X, Home, FilePlus, BadgeCheck, CircleHelp, BarChart3, ChevronDown, LogOut } from 'lucide-react';
import profileIcon from '../assets/profile-icon.png';
import './UserNavbar.css';

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        axios.get('http://localhost:5000/api/connections/my-request', {
          headers: { Authorization: `Bearer ${parsedUser.token}` }
        }).then(res => setConnectionStatus(res.data))
          .catch(err => setConnectionStatus({ status: 'Not Applied' }));
      } catch (err) {
        setUser(null);
      }
    }
  }, []);

  const { isAllowed } = useLifecycle(connectionStatus);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="user-navbar">
      <div className="navbar-brand">
        <div className="navbar-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} color="#ffffff" /> : <Menu size={24} color="#ffffff" />}
        </div>
        <Link to="/homepage" className="brand-logo">
          ⚡ <span>Smart Electricity Portal</span>
        </Link>
      </div>
      
      <div className={`navbar-center ${isMobileMenuOpen ? 'open' : ''}`}>
        {isAllowed('/homepage') && (
          <Link to="/homepage" className={location.pathname === '/homepage' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
            <Home size={18} /> Home
          </Link>
        )}
        {isAllowed('/apply') && (
          <Link to="/apply" className={location.pathname === '/apply' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
            <FilePlus size={18} /> Apply
          </Link>
        )}
        {isAllowed('/kyc-bill') && (
          <Link to="/kyc-bill" className={location.pathname === '/kyc-bill' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
            <BadgeCheck size={18} /> KYC
          </Link>
        )}
        {isAllowed('/helpdesk') && (
          <Link to="/helpdesk" className={location.pathname === '/helpdesk' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
            <CircleHelp size={18} /> Helpdesk
          </Link>
        )}
        {isAllowed('/tracker') && (
          <Link to="/tracker" className={location.pathname === '/tracker' ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
            <BarChart3 size={18} /> Tracker
          </Link>
        )}
      </div>

      <div className="navbar-right">
        <div className="profile-trigger" onClick={() => setShowProfile(!showProfile)}>
          <img
            src={profileIcon}
            alt="Profile"
            className="profile-avatar"
          />
          <span className="profile-name">{user?.name || 'User'}</span>
          <ChevronDown size={16} color="#ffffff" className={`dropdown-icon ${showProfile ? 'open' : ''}`} />
        </div>

        {showProfile && user && (
          <div className="profile-dropdown">
            <div className="dropdown-header">
              <img src={profileIcon} alt="Profile" className="dropdown-avatar" />
              <div className="dropdown-user-info">
                <h4>{user.name || 'User'}</h4>
                <span className="dropdown-role">Customer Account</span>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-body">
              <p><span>Account No:</span> <strong>{user.meterNumber || '—'}</strong></p>
              <p><span>Email:</span> <strong>{user.email || '—'}</strong></p>
            </div>
            <div className="dropdown-divider"></div>
            <button className="dropdown-logout" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UserNavbar;