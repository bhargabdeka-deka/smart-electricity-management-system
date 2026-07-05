import React from 'react';
import { RefreshCw } from 'lucide-react';
import './Dashboard.css';

const DashboardHeader = ({ name, refreshData, loading, lastChecked }) => {
  return (
    <div className="dash-header-row">
      <div className="dash-header">
        <h1>Good Morning, {name ? name.split(' ')[0] : 'Customer'}!</h1>
        <div className="dash-greeting">Welcome back to your Smart Electricity Portal.</div>
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
