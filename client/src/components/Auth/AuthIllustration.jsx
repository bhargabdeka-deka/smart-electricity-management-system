import React from 'react';
import { ShieldCheck, Activity, Zap, Clock } from 'lucide-react';

const AuthIllustration = () => {
  return (
    <div className="auth-illustration-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="auth-svg-container" style={{ transform: 'scale(0.9)', transformOrigin: 'center', margin: '0 auto' }}>
        {/* Simple inline SVG for Power Grid / Smart Meter concept */}
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" rx="16" fill="rgba(255,255,255,0.1)"/>
          <path d="M120 220V140C120 128.954 128.954 120 140 120H260C271.046 120 280 128.954 280 140V220" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          <circle cx="200" cy="170" r="30" stroke="#F59E0B" strokeWidth="10"/>
          <path d="M200 170L200 155" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
          <rect x="150" y="220" width="100" height="20" rx="4" fill="white"/>
          <path d="M180 90L200 120L220 90" stroke="#16A34A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="200" cy="70" r="10" fill="#16A34A"/>
        </svg>
      </div>

      <h2>Smart Electricity</h2>
      <p>Your centralized portal for modern utility management.</p>

      <div className="auth-benefits">
        <div className="auth-benefit-item">
          <ShieldCheck size={24} /> Secure Authentication
        </div>
        <div className="auth-benefit-item">
          <Zap size={24} /> Digital Services
        </div>
        <div className="auth-benefit-item">
          <Activity size={24} /> Real-Time Tracking
        </div>
        <div className="auth-benefit-item">
          <Clock size={24} /> Fast Approval
        </div>
      </div>
    </div>
  );
};

export default AuthIllustration;
