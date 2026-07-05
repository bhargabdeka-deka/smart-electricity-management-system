import React from 'react';
import { Clock } from 'lucide-react';
import './Dashboard.css';

const stages = [
  'Pending',
  'Under Review',
  'Approved',
  'Engineer Assigned',
  'Visit Scheduled',
  'Installation In Progress',
  'Meter Installed',
  'Completed'
];

const getStageLabel = (stage) => {
  if (stage === 'Pending') return 'Application Submitted';
  if (stage === 'Under Review') return 'Documents Verified';
  return stage;
};

const getCurrentIndex = (currentStatus) => {
  if (!currentStatus || currentStatus === 'Not Applied' || currentStatus === 'Rejected') return -1;
  return stages.indexOf(currentStatus);
};

const TimelineCard = ({ status }) => {
  if (!status || status.status === 'Not Applied' || status.status === 'Rejected') {
    return (
      <div className="dash-card">
        <h3 className="dash-card-title"><Clock size={20} /> Connection Timeline</h3>
        <p style={{ color: '#6B7280' }}>
          {status?.status === 'Rejected' ? '❌ Your application was rejected.' : 'No active connection request.'}
        </p>
      </div>
    );
  }

  const currentIdx = getCurrentIndex(status.status);

  return (
    <div className="dash-card">
      <h3 className="dash-card-title"><Clock size={20} /> Live Connection Tracking</h3>
      
      <div className="timeline-container">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentIdx;
          const isCurrent = index === currentIdx;
          return (
            <div key={stage} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-circle">{isCompleted ? '✓' : index + 1}</div>
              <div className="step-label">{getStageLabel(stage)}</div>
            </div>
          );
        })}
      </div>

      <div className="timeline-details">
        <div className="timeline-details-row">
          <span>Application ID:</span>
          <strong>{status._id}</strong>
        </div>
        <div className="timeline-details-row">
          <span>Current Status:</span>
          <strong style={{ color: '#005BAC' }}>{status.status}</strong>
        </div>

        {status.assignedEngineer && (
          <>
            <div className="timeline-details-row">
              <span>Assigned Engineer:</span>
              <strong>{status.assignedEngineer.name}</strong>
            </div>
            <div className="timeline-details-row">
              <span>Contact Number:</span>
              <strong>{status.assignedEngineer.phoneNumber}</strong>
            </div>
          </>
        )}

        {status.visitDate && (
          <div className="timeline-details-row">
            <span>Scheduled Visit:</span>
            <strong>{status.visitDate.slice(0, 10)}</strong>
          </div>
        )}
        {status.meterSerialNumber && (
          <div className="timeline-details-row">
            <span>Meter Serial:</span>
            <strong>{status.meterSerialNumber}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineCard;
