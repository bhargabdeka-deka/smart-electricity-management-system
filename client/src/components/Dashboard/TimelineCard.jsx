import React from 'react';
import { Clock } from 'lucide-react';
import './Dashboard.css';

const stages = [
  'Pending',
  'Under Review',
  'Approved',
  'Engineer Assigned',
  'Visit Scheduled',
  'Inspection Completed',
  'Installation In Progress',
  'Meter Installed',
  'Connection Activated',
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

const TimelineCard = ({ status, config }) => {
  if (!config?.visible) return null;

  if (!status || status.status === 'Not Applied' || status.status === 'Rejected') {
    return (
      <div className="dash-card">
        <h3 className="dash-card-title"><Clock size={20} /> {config.title || 'Connection Timeline'}</h3>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6B7280' }}>
          <Clock size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>{status?.status === 'Rejected' ? '❌ Your application was rejected.' : 'No active connection request.'}</p>
        </div>
      </div>
    );
  }

  const currentIdx = getCurrentIndex(status.status);

  return (
    <div className="dash-card">
      <h3 className="dash-card-title"><Clock size={20} /> {config.title || 'Live Connection Tracking'}</h3>
      
      <div className="timeline-container">
        {(status.status === 'Withdrawn' 
          ? ['Registered', 'Application Submitted', 'Application Withdrawn', 'Under Review', 'Approved', 'Engineer Assigned', 'Visit Scheduled', 'Inspection Completed', 'Installation In Progress', 'Meter Installed', 'Connection Activated', 'Completed'] 
          : stages
        ).map((stage, index) => {
          let isCompleted = false;
          let isCurrent = false;
          let isCancelled = false;

          if (status.status === 'Withdrawn') {
            if (index <= 1) isCompleted = true;
            else if (index === 2) isCurrent = true;
            else isCancelled = true;
          } else {
            isCompleted = index <= currentIdx;
            isCurrent = index === currentIdx;
          }

          const isWithdrawnStep = status.status === 'Withdrawn' && stage === 'Application Withdrawn';
          let circleContent = isCompleted ? '✓' : index + 1;
          if (isWithdrawnStep) circleContent = '❌';
          if (isCancelled && status.status === 'Withdrawn') circleContent = index; // Adjust index because we added Registered and Withdrawn

          return (
            <div key={stage} className={`timeline-step ${isCompleted && !isWithdrawnStep ? 'completed' : ''} ${isCurrent && !isWithdrawnStep ? 'current' : ''} ${isCancelled ? 'cancelled' : ''}`} style={isCancelled ? { opacity: 0.4 } : {}}>
              <div 
                className="step-circle" 
                style={isWithdrawnStep ? { backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#DC2626' } : {}}
              >
                {circleContent}
              </div>
              <div className="step-label" style={isWithdrawnStep ? { color: '#DC2626', fontWeight: 'bold' } : {}}>
                {isWithdrawnStep ? stage : getStageLabel(stage)}
                {isWithdrawnStep && (
                  <>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal', marginTop: '2px' }}>Withdrawn by Customer</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'normal', marginTop: '2px', fontStyle: 'italic' }}>Remaining processing cancelled.</div>
                  </>
                )}
              </div>
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
        
        {status.expectedCompletionDate && (
          <div className="timeline-details-row">
            <span>Expected Completion:</span>
            <strong>{status.expectedCompletionDate.slice(0, 10)}</strong>
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
