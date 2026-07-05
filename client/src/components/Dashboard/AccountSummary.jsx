import React from 'react';
import { User, MapPin, Zap, Activity, Hash, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import './Dashboard.css';
import CopyApplicationIdButton from './CopyApplicationIdButton';

const AccountSummary = ({ user, connectionStatus, dashboardData, config }) => {
  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Number copied to clipboard!');
    }
  };

  const status = connectionStatus?.status || 'Not Applied';
  const type = connectionStatus?.meterType || 'Domestic';
  const account = dashboardData?.meterNumber || user?.meterNumber || 'Pending';
  const physicalMeter = connectionStatus?.meterSerialNumber;
  const appId = connectionStatus?.applicationId || (connectionStatus?._id ? `APP-${connectionStatus._id.slice(-6).toUpperCase()}` : null);
  const consumerId = connectionStatus?.consumerId || 'Pending';
  const district = user?.district || 'Not Assigned';

  if (!config?.visible) return null;

  return (
    <div className="dash-account-summary">
      <div className="summary-col">
        <div className="summary-label">
          <Hash size={14} /> Account Number
        </div>
        <div className="summary-value copyable" onClick={() => handleCopy(account)}>
          {account} <Copy size={12} className="copy-icon" />
        </div>
      </div>

      {config.showAppId && appId && (
        <div className="summary-col">
          <div className="summary-label">
            <Hash size={14} /> Application ID
          </div>
          <div className="summary-value" style={{ display: 'flex', alignItems: 'center' }}>
            {appId} <CopyApplicationIdButton id={appId} />
          </div>
        </div>
      )}

      {config.showConsumerId && (
        <div className="summary-col">
          <div className="summary-label">
            <User size={14} /> Consumer Number
          </div>
          <div className="summary-value">
            {consumerId}
          </div>
        </div>
      )}

      {config.showPhysicalMeter && physicalMeter && (
        <div className="summary-col" style={{ borderLeft: '2px solid #E5E7EB', paddingLeft: '1rem' }}>
          <div className="summary-label" style={{ color: '#005BAC' }}>
            <Zap size={14} /> Physical Meter
          </div>
          <div className="summary-value copyable" onClick={() => handleCopy(physicalMeter)}>
            {physicalMeter} <Copy size={12} className="copy-icon" />
          </div>
        </div>
      )}

      <div className="summary-col">
        <div className="summary-label">
          <MapPin size={14} /> District
        </div>
        <div className="summary-value">
          {district.replace(/_/g, ' ')}
        </div>
      </div>

      {config.showAppId && (
        <div className="summary-col">
          <div className="summary-label">
            <Zap size={14} /> Connection Type
          </div>
          <div className="summary-value">
            {type}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSummary;
