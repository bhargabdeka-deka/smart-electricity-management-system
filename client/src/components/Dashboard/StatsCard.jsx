import React from 'react';
import { Activity, AlertCircle, FileCheck, IndianRupee, Zap } from 'lucide-react';
import './Dashboard.css';

const StatsCard = ({ connectionStatus, complaintStatus, kycStatus, usageData, config }) => {
  if (!config?.visible) return null;

  const fields = config.fields || [];

  let unitsConsumed = 0;
  let estimatedBill = 0;
  
  if (usageData && usageData.length > 0) {
    const latestUsage = usageData[usageData.length - 1];
    unitsConsumed = latestUsage.units || 0;
    estimatedBill = latestUsage.billAmount || (unitsConsumed * 7).toFixed(2);
  }

  return (
    <>
      <h3 className="dash-card-title" style={{ marginTop: '2rem' }}>{config.title}</h3>
      <div className="dash-stats-grid">
        {fields.includes('connection_status') && (
          <div className="dash-card stat-box">
            <div className="stat-icon blue"><Activity size={24} /></div>
            <div className="stat-content">
              <p>Connection Status</p>
              <h4>{connectionStatus || 'Not Applied'}</h4>
            </div>
          </div>
        )}
        
        {fields.includes('kyc_status') && (
          <div className="dash-card stat-box">
            <div className="stat-icon green"><FileCheck size={24} /></div>
            <div className="stat-content">
              <p>KYC Status</p>
              <h4>{kycStatus || 'Pending'}</h4>
            </div>
          </div>
        )}

        {fields.includes('complaints') && (
          <div className="dash-card stat-box">
            <div className="stat-icon red"><AlertCircle size={24} /></div>
            <div className="stat-content">
              <p>Active Complaints</p>
              <h4>{complaintStatus || 'No Issues'}</h4>
            </div>
          </div>
        )}

        {fields.includes('energy_usage') && (
          <div className="dash-card stat-box">
            <div className="stat-icon orange">
              {unitsConsumed > 0 ? <Zap size={24} /> : <IndianRupee size={24} />}
            </div>
            <div className="stat-content">
              {unitsConsumed > 0 ? (
                <>
                  <p>Energy Usage</p>
                  <h4>{unitsConsumed} Units</h4>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Est. Bill: ₹{estimatedBill}</span>
                </>
              ) : (
                <>
                  <p>Estimated Bill</p>
                  <h4>₹0</h4>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StatsCard;
