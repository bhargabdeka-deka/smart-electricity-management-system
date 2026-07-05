import React from 'react';
import { Activity, AlertCircle, FileCheck, IndianRupee } from 'lucide-react';
import './Dashboard.css';

const StatsCard = ({ connectionStatus, complaintStatus, kycStatus, estimatedBill }) => {
  return (
    <div className="dash-stats-grid">
      <div className="dash-card stat-box">
        <div className="stat-icon blue"><Activity size={24} /></div>
        <div className="stat-content">
          <p>Connection Status</p>
          <h4>{connectionStatus || 'Not Applied'}</h4>
        </div>
      </div>
      
      <div className="dash-card stat-box">
        <div className="stat-icon red"><AlertCircle size={24} /></div>
        <div className="stat-content">
          <p>Complaint Status</p>
          <h4>{complaintStatus || 'No Issues'}</h4>
        </div>
      </div>

      <div className="dash-card stat-box">
        <div className="stat-icon green"><FileCheck size={24} /></div>
        <div className="stat-content">
          <p>KYC Status</p>
          <h4>{kycStatus || 'Pending'}</h4>
        </div>
      </div>

      <div className="dash-card stat-box">
        <div className="stat-icon orange"><IndianRupee size={24} /></div>
        <div className="stat-content">
          <p>Estimated Bill</p>
          <h4>₹{estimatedBill || '0'}</h4>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
