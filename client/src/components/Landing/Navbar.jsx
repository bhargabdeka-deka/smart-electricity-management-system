import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import './Landing.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-container">
        <div className="landing-brand">
          <Zap size={24} color="#F59E0B" />
          <span>Smart Electricity Platform</span>
        </div>
        
        <div className="landing-nav-links">
          <Link to="/">Home</Link>
          <a href="/#services">Services</a>
          <a href="/#workflow">How It Works</a>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-btn landing-btn-secondary" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="landing-btn landing-btn-accent" onClick={() => navigate('/signup')}>
            Apply Connection
          </button>
        </div>

        <button className="landing-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="landing-mobile-menu">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <a href="/#services" onClick={() => setIsOpen(false)}>Services</a>
          <a href="/#workflow" onClick={() => setIsOpen(false)}>How It Works</a>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          
          <div className="landing-mobile-actions">
            <button className="landing-btn landing-btn-secondary" onClick={() => { navigate('/login'); setIsOpen(false); }}>
              Login
            </button>
            <button className="landing-btn landing-btn-accent" onClick={() => { navigate('/signup'); setIsOpen(false); }}>
              Apply Connection
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
