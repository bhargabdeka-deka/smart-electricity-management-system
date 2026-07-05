import React from 'react';
import CopyApplicationIdButton from './CopyApplicationIdButton';

const getStatusColor = (stat) => {
  if (['Pending', 'Under Review', 'Submitted'].includes(stat)) return '#3B82F6'; // Blue
  if (['Approved', 'Completed', 'Meter Installed', 'Activated'].includes(stat)) return '#10B981'; // Green
  if (stat === 'Rejected') return '#EF4444'; // Red
  if (stat === 'Withdrawn') return '#EA580C'; // Orange/Red
  return '#6B7280'; // Gray default
};

const getStatusBgColor = (stat) => {
  if (['Pending', 'Under Review', 'Submitted'].includes(stat)) return '#EFF6FF';
  if (['Approved', 'Completed', 'Meter Installed', 'Activated'].includes(stat)) return '#ECFDF5';
  if (stat === 'Rejected') return '#FEF2F2';
  if (stat === 'Withdrawn') return '#FFF7ED';
  return '#F3F4F6';
};

const ApplicationHistoryCard = ({ application, onViewDetails }) => {
  const displayId = application.applicationId || (application._id ? `APP-${application._id.slice(-6).toUpperCase()}` : 'N/A');
  const statusColor = getStatusColor(application.status);
  const statusBgColor = getStatusBgColor(application.status);
  
  return (
    <div className="dash-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${statusColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: '600' }}>
              {displayId}
            </h4>
            <CopyApplicationIdButton id={displayId} />
          </div>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>New Electricity Connection</p>
        </div>
        
        <span style={{ 
          backgroundColor: statusBgColor, 
          color: statusColor, 
          padding: '4px 12px', 
          borderRadius: '9999px', 
          fontSize: '14px', 
          fontWeight: '600',
          border: `1px solid ${statusColor}40` 
        }}>
          {application.status}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '1rem 0' }}>
        <div>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</p>
          <p style={{ margin: 0, color: '#111827', fontWeight: '500' }}>
            {application.createdAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(application.createdAt)) : 'N/A'}
          </p>
        </div>
        <div>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</p>
          <p style={{ margin: 0, color: '#111827', fontWeight: '500' }}>
            {application.withdrawnAt ? 
              new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(application.withdrawnAt)) : 
              (application.decisionDate ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(application.decisionDate)) : 'Processing')
            }
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => onViewDetails(application)}
          style={{ 
            backgroundColor: 'transparent', 
            color: '#2563EB', 
            border: 'none', 
            fontWeight: '600', 
            cursor: 'pointer', 
            fontSize: '14px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#EFF6FF'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default ApplicationHistoryCard;
