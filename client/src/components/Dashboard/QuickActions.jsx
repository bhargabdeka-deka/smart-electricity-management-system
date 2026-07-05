import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, HeadphonesIcon, FileText, BarChart2, Zap } from 'lucide-react';
import './Dashboard.css';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="dash-card">
      <h3 className="dash-card-title">
        <Zap size={20} /> Quick Actions
      </h3>
      <div className="quick-action-grid">
        <button className="quick-action-btn" onClick={() => navigate('/apply')}>
          <PlusCircle size={20} /> Apply Connection
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/helpdesk')}>
          <HeadphonesIcon size={20} /> Complaint Portal
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/kyc-bill')}>
          <FileText size={20} /> Update KYC
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/tracker')}>
          <BarChart2 size={20} /> Energy Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
