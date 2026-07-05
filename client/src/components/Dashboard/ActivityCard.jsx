import React from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const ActivityCard = ({ activities }) => {
  return (
    <div className="dash-card">
      <h3 className="dash-card-title"><Bell size={20} /> Recent Activities</h3>
      
      {(!activities || activities.length === 0) ? (
        <p style={{ color: '#6B7280' }}>No recent activity to show.</p>
      ) : (
        <div className="activity-list">
          {activities.map((act, idx) => (
            <div key={idx} className="activity-item">
              <div className="activity-icon">
                {act.type === 'success' && <CheckCircle size={18} color="#16A34A" />}
                {act.type === 'pending' && <Clock size={18} color="#F59E0B" />}
                {act.type === 'alert' && <AlertTriangle size={18} color="#DC2626" />}
                {act.type === 'info' && <Bell size={18} color="#005BAC" />}
              </div>
              <div className="activity-content">
                <p>{act.message}</p>
                <span>{act.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
