import React from 'react';
import { BarChart2 } from 'lucide-react';
import './Dashboard.css';

const EnergyPreview = ({ usageData, config }) => {
  if (!config?.visible) return null;

  return (
    <div className="dash-card">
      <h3 className="dash-card-title"><BarChart2 size={20} /> {config.title || 'Energy Usage Preview'}</h3>
      
      {!usageData || usageData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6B7280' }}>
          <BarChart2 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No energy usage data available yet.</p>
        </div>
      ) : (
        <div className="energy-preview-bars">
          {/* Show only last 4 months for the preview to keep it compact */}
          {usageData.slice(-4).map((data, idx) => {
            // max mock units is around 560, scale height out of 100px
            const maxUnits = 600;
            const height = Math.max((data.units / maxUnits) * 120, 20); // min 20px

            return (
              <div key={idx} className="energy-bar-col">
                <div 
                  className="energy-bar" 
                  style={{ height: `${height}px` }} 
                  title={`${data.units} kWh`}
                ></div>
                <span className="energy-label">
                  {new Date(data.month + '-01').toLocaleString('default', { month: 'short' })}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{data.units}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnergyPreview;
