import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import './Landing.css';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <div className="landing-brand" style={{ marginBottom: '1rem' }}>
            <Zap size={24} color="#F59E0B" />
            <span style={{ color: 'white' }}>Smart Electricity</span>
          </div>
          <p>
            An integrated utility management system designed to bring transparency, 
            speed, and reliability to citizen electricity services.
          </p>
        </div>
        
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="/#services">New Connection</a></li>
            <li><a href="/#services">KYC Update</a></li>
            <li><a href="/#services">Complaints</a></li>
            <li><a href="/#services">Energy Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/accessibility">Accessibility Statement</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Smart Electricity Management Platform</p>
        <p style={{ marginTop: '0.25rem', color: '#6B7280' }}>
          Built using React, Node.js, Express.js and MongoDB
        </p>
      </div>
    </footer>
  );
};

export default Footer;
