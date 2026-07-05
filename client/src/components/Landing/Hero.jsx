import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, Activity } from 'lucide-react';
import './Landing.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="landing-hero">
      <div className="landing-hero-content">
        <h1>Smart Electricity Management Platform</h1>
        <p>
          Manage electricity connections, KYC updates, complaints and energy usage 
          through one secure digital platform designed for citizens and engineers.
        </p>
        
        <div className="landing-hero-buttons">
          <button className="landing-btn landing-btn-primary" onClick={() => navigate('/apply')}>
            Apply for New Connection
          </button>
          <button className="landing-btn landing-btn-secondary" onClick={() => navigate('/login')}>
            Login to Dashboard
          </button>
        </div>

        <div className="landing-hero-trust">
          <span><ShieldCheck size={18} /> Secure Authentication & KYC</span>
          <span><Clock size={18} /> Fast Application Approval</span>
          <span><Activity size={18} /> Real-Time Application Tracking</span>
        </div>
      </div>

      <div className="landing-hero-image">
        {/* Professional SVG illustration related to power grid/meters */}
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" rx="16" fill="#F0F7FF"/>
          <path d="M120 220V140C120 128.954 128.954 120 140 120H260C271.046 120 280 128.954 280 140V220" stroke="#005BAC" strokeWidth="12" strokeLinecap="round"/>
          <circle cx="200" cy="170" r="30" stroke="#F59E0B" strokeWidth="10"/>
          <path d="M200 170L200 155" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
          <rect x="150" y="220" width="100" height="20" rx="4" fill="#111827"/>
          <path d="M180 90L200 120L220 90" stroke="#16A34A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="200" cy="70" r="10" fill="#16A34A"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
