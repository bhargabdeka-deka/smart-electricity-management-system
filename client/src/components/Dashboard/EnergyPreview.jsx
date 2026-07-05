import React from 'react';
import { BarChart2 } from 'lucide-react';
import './Dashboard.css';

const EnergyPreview = ({ usageData }) => {
  return (
    <div className="dash-card">
      <h3 className="dash-card-title"><BarChart2 size={20} /> Energy Usage Preview</h3>
      
      {!usageData || usageData.length === 0 ? (
        <p style={{ color: '#6B7280' }}>Loading usage data...</p>
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
