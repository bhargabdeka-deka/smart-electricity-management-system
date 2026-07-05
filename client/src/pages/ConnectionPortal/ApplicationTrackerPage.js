import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, Activity } from 'lucide-react';


import ApplicationHistory from '../../components/Dashboard/ApplicationHistory';
import CopyApplicationIdButton from '../../components/Dashboard/CopyApplicationIdButton';

const STATUS_STAGES = [
  'Registered',
  'Application Submitted',
  'Under Review',
  'Approved',
  'Engineer Assigned',
  'Visit Scheduled',
  'Installation In Progress',
  'Meter Installed',
  'Activated'
];

export default function ApplicationTrackerPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('history');
  const [status, setStatus] = useState('Loading...');
  const [reqData, setReqData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  // Map backend "Pending" status to UI "Application Submitted"
  const displayStatus = status === 'Pending' ? 'Application Submitted' : status;
  const currentStageIndex = STATUS_STAGES.indexOf(displayStatus) >= 0 ? STATUS_STAGES.indexOf(displayStatus) : (status === 'Not Applied' ? 0 : 1);

  // Status Color Helper
  const getStatusColor = (stat) => {
    if (['Pending', 'Under Review'].includes(stat)) return '#3B82F6'; // Blue
    if (['Approved', 'Completed', 'Meter Installed', 'Activated'].includes(stat)) return '#10B981'; // Green
    if (stat === 'Rejected') return '#EF4444'; // Red
    if (stat === 'Withdrawn') return '#EA580C'; // Orange/Red
    return '#6B7280'; // Gray default
  };

  if (viewMode === 'history') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '32px', color: '#1F2937', margin: '0 0 8px 0' }}>Application History</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem' }}>View and track all your electricity connection requests.</p>
        <ApplicationHistory 
          user={user} 
          onViewDetails={(app) => {
            setReqData(app);
            setStatus(app.status);
            setViewMode('details');
          }} 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <button 
        onClick={() => setViewMode('history')}
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4B5563', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: '500' }}
      >
        ← Back to History
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '32px', color: '#1F2937', margin: 0 }}>Application Tracker</h1>
        {status === 'Withdrawn' && (
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#EA580C', color: 'white', padding: '6px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: '600', gap: '6px' }}>
            <span style={{ fontSize: '12px' }}>❌</span> Withdrawn
          </div>
        )}
      </div>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Track the progress of your new electricity connection request.</p>
      
      <div className="conn-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Account Number</p>
            <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>{user.meterNumber || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Application ID</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
                {reqData?.applicationId || (reqData?._id ? `APP-${reqData._id.slice(-6).toUpperCase()}` : 'Pending Generation')}
              </p>
              {reqData && <CopyApplicationIdButton id={reqData?.applicationId || (reqData?._id ? `APP-${reqData._id.slice(-6).toUpperCase()}` : '')} />}
            </div>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Consumer ID</p>
            <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
              {['Approved', 'Engineer Assigned', 'Visit Scheduled', 'Installation In Progress', 'Meter Installed', 'Activated'].includes(status) 
                ? (reqData?.consumerId || 'Pending Generation') 
                : 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Meter Number</p>
            <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
              {['Meter Installed', 'Activated'].includes(status) 
                ? (reqData?.physicalMeterNumber || 'Pending Generation') 
                : 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Current Status</p>
            <p style={{ fontWeight: '600', color: getStatusColor(status), margin: 0, fontSize: '18px' }}>{displayStatus}</p>
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Submission Date</p>
            <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
              {reqData?.createdAt ? new Date(reqData.createdAt).toLocaleDateString() : 'Awaiting Submission Timestamp'}
            </p>
          </div>
          {status === 'Withdrawn' && (
            <>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Withdrawal Date</p>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
                  {reqData?.withdrawnAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(reqData.withdrawnAt)).replace(',', ' •') : 'Not Available'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Reason</p>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
                  {reqData?.withdrawalReason || 'Customer Request'}
                </p>
              </div>
            </>
          )}
          {status !== 'Withdrawn' && (
            <div>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Estimated Review Time</p>
              <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
                {status === 'Pending' ? '2-3 Business Days' : 'N/A'}
              </p>
            </div>
          )}
          <div>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Assigned Engineer</p>
            <div style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
              {['Engineer Assigned', 'Visit Scheduled', 'Installation In Progress'].includes(status) ? (
                reqData?.assignedEngineer ? (
                  <>
                    <p style={{ margin: '0 0 2px 0' }}>{reqData.assignedEngineer.name}</p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '14px', color: '#4B5563' }}>{reqData.assignedEngineer.phone || 'Phone pending'}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4B5563' }}>Visit: {reqData.visitDate ? new Date(reqData.visitDate).toLocaleDateString() : 'TBD'}</p>
                  </>
                ) : (
                  'Pending Sync'
                )
              ) : (
                'Not Assigned Yet'
              )}
            </div>
          </div>
          
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Applicant Name</p>
              <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{reqData?.fullName || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Contact Number</p>
              <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{reqData?.contact || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Applicant Type</p>
              <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{reqData?.userType || 'N/A'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Installation Address</p>
              <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{reqData?.address || 'N/A'} - {reqData?.pincode || ''}</p>
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem' }}>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px 0' }}>Uploaded Documents</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {reqData?.documents && reqData.documents.length > 0 ? reqData.documents.map((doc, i) => (
                <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ textDecoration: 'none', padding: '8px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '14px', color: '#2563EB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📄</span> <span style={{ textDecoration: 'underline' }}>{doc}</span>
                </a>
              )) : (
                <span style={{ fontSize: '14px', color: '#6B7280' }}>No documents found</span>
              )}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '20px', color: '#1F2937', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          Progress Timeline
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(status === 'Withdrawn' ? ['Registered', 'Application Submitted', 'Application Withdrawn'] : STATUS_STAGES).map((stage, idx) => {
            let isCompleted = false;
            let isCurrent = false;

            if (status === 'Withdrawn') {
              isCompleted = idx <= 1; // Registered and Submitted
              isCurrent = idx === 2; // Withdrawn
            } else {
              isCompleted = idx < currentStageIndex;
              isCurrent = idx === currentStageIndex;
            }

            const isWithdrawnStep = status === 'Withdrawn' && stage === 'Application Withdrawn';
            
            let color = '#D1D5DB'; // default gray
            let Icon = Clock;
            
            if (isWithdrawnStep) {
              color = '#DC2626'; // red
              Icon = Clock; // could use another icon, but Clock is fine or X
            } else if (isCompleted) {
              color = '#10B981'; // green
              Icon = CheckCircle;
            } else if (isCurrent) {
              color = '#3B82F6'; // blue
              Icon = Activity;
            }

            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  marginTop: '2px', 
                  backgroundColor: (isCompleted || isCurrent || isWithdrawnStep) ? `${color}20` : '#F3F4F6',
                  color: color,
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isWithdrawnStep ? <span style={{ fontSize: '18px', lineHeight: '20px' }}>❌</span> : <Icon size={20} />}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: (isCurrent || isWithdrawnStep) ? '#111827' : (isCompleted ? '#374151' : '#9CA3AF') }}>
                    {stage}
                  </h4>
                  {isCurrent && !isWithdrawnStep && <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Currently processing this stage.</p>}
                  {isWithdrawnStep && <p style={{ margin: 0, fontSize: '14px', color: '#DC2626' }}>Withdrawn by Customer</p>}
                  {isCompleted && !isWithdrawnStep && <p style={{ margin: 0, fontSize: '14px', color: '#10B981' }}>Completed</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/homepage')} 
            style={{ padding: '10px 24px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
