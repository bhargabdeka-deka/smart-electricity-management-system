import React from 'react';
import { RefreshCw } from 'lucide-react';
import './Dashboard.css';

const DashboardHeader = ({ name, refreshData, loading, lastChecked, config }) => {
  return (
    <div className="dash-header-row">
      <div className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1F2937', 
            margin: 0 
          }}>
            Customer Dashboard
          </h1>
          {config?.statusBadge?.show && (
            <span className={`status-badge status-${config.statusBadge.color}`}>
              {config.statusBadge.color === 'orange' && <span style={{ marginRight: '4px', fontSize: '12px', lineHeight: 1 }}>❌</span>}
              {config.statusBadge.color === 'red' && <span style={{ marginRight: '4px', fontSize: '12px', lineHeight: 1 }}>❌</span>}
              {config.statusBadge.color === 'green' && <span style={{ marginRight: '4px', fontSize: '12px', lineHeight: 1 }}>✅</span>}
              {config.statusBadge.text}
            </span>
          )}
        </div>
        <p style={{ 
          fontSize: '16px', 
          color: '#6B7280', 
          marginTop: '8px', 
          marginBottom: 0 
        }}>
          Manage your electricity connection, applications and services from one secure portal.
        </p>
      </div>
      
      <div>
        <button 
          className="dash-refresh-btn" 
          onClick={refreshData} 
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
        {!loading && lastChecked && (
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', textAlign: 'right' }}>
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
