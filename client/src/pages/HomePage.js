import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLifecycle } from '../hooks/useLifecycle';
import {
  DashboardHeader,
  AccountSummary,
  StatsCard,
  QuickActions,
  TimelineCard,
  EnergyPreview,
  ActivityCard,
  RegisteredView,
  CopyApplicationIdButton
} from '../components/Dashboard';
import '../components/Dashboard/Dashboard.css';

function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const [complaintData, setComplaintData] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [activities, setActivities] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const { stateKey, config } = useLifecycle(connectionStatus);

  // 1. Session verification
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.token) {
          setUser(parsedUser);
        } else {
          localStorage.clear();
          navigate('/login');
        }
      } catch {
        localStorage.clear();
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // 2. Main data fetching function
  const fetchAllData = useCallback(async () => {
    if (!user?.token) return;
    setStatusLoading(true);

    const headers = { Authorization: `Bearer ${user.token}` };
    const api = axios.create({ baseURL: 'http://localhost:5000/api', headers });

    try {
      const [dashRes, connRes, usageRes, complaintRes] = await Promise.allSettled([
        api.get('/users/dashboard'),
        api.get('/connections/my-request'),
        api.get('/users/usage'),
        api.get('/users/helpdesk')
      ]);

      let meterNumber = null;

      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value.data);
        meterNumber = dashRes.value.data.meterNumber;
      }

      if (connRes.status === 'fulfilled') {
        setConnectionStatus(connRes.value.data);
      } else {
        setConnectionStatus({ status: 'Not Applied' });
      }

      if (usageRes.status === 'fulfilled') {
        setUsageData(usageRes.value.data);
      }

      if (complaintRes.status === 'fulfilled') {
        setComplaintData(complaintRes.value.data);
      }

      if (meterNumber) {
        try {
          const kycRes = await api.get(`/users/kyc-status?meter=${meterNumber}`);
          setKycData(kycRes.data);
        } catch (error) {
          setKycData({ kycStatus: 'Pending' });
        }
      } else {
        setKycData({ kycStatus: 'Pending' });
      }

      generateActivities(connRes, complaintRes);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setStatusLoading(false);
      setLoading(false);
    }
  }, [user?.token]);

  const generateActivities = (connRes, complaintRes) => {
    const newActivities = [];
    newActivities.push({ type: 'info', message: 'Secure login successful.', date: new Date().toLocaleDateString() });

    if (connRes.status === 'fulfilled' && connRes.value.data && connRes.value.data.status !== 'Not Applied') {
      const connStat = connRes.value.data.status;
      if (connStat === 'Withdrawn') {
        newActivities.push({
          type: 'alert',
          message: 'Application withdrawn successfully.\nCustomer requested cancellation.',
          date: connRes.value.data.withdrawnAt ? new Date(connRes.value.data.withdrawnAt).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Not Available'
        });
      } else {
        newActivities.push({
          type: connStat === 'Completed' || connStat === 'Meter Installed' ? 'success' : 'pending',
          message: `Connection Request: ${connStat}`,
          date: connRes.value.data.assignmentDate ? new Date(connRes.value.data.assignmentDate).toLocaleDateString() : 'Recent'
        });
      }
    }

    if (complaintRes.status === 'fulfilled' && complaintRes.value.data) {
      const compStat = complaintRes.value.data.status;
      newActivities.push({
        type: compStat === 'Resolved' ? 'success' : 'alert',
        message: `Helpdesk Ticket: ${compStat}`,
        date: new Date(complaintRes.value.data.createdAt).toLocaleDateString()
      });
    }
    setActivities(newActivities);
  };

  useEffect(() => {
    if (user?.token) {
      fetchAllData();
    }
  }, [user?.token, fetchAllData]);

  if (loading) {
    return (
      <div className="dash-container">
        <div className="dash-header-row">
          <div className="dash-header" style={{ width: '100%' }}>
            <div className="skeleton skeleton-title"></div>
          </div>
        </div>
        <div className="skeleton skeleton-block" style={{ marginBottom: '2rem' }}></div>
      </div>
    );
  }

  if (!user || !config) return null;

  if (stateKey === 'registered') {
    return (
      <div className="dash-container">
        <DashboardHeader 
          name={dashboardData?.name || user?.name} 
          refreshData={fetchAllData} 
          loading={statusLoading} 
          lastChecked={lastChecked} 
          config={config}
        />
        <RegisteredView 
          user={user} 
          dashboardData={dashboardData} 
        />
      </div>
    );
  }

  return (
    <div className="dash-container">
      {/* 1. Header Section */}
      <DashboardHeader 
        name={dashboardData?.name || user?.name} 
        refreshData={fetchAllData} 
        loading={statusLoading} 
        lastChecked={lastChecked} 
        config={config}
      />

      {/* 1.5 Account Summary */}
      <AccountSummary 
        user={user} 
        connectionStatus={connectionStatus} 
        dashboardData={dashboardData}
        config={config?.widgets?.accountSummary || { visible: false }}
      />

      {config?.widgets?.rejectionReason?.visible && (
        <div className="dash-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #DC2626' }}>
          <h3 style={{ color: '#DC2626', margin: '0 0 0.5rem 0' }}>{config.widgets.rejectionReason.title}</h3>
          <p>{connectionStatus?.remarks || 'Your application was rejected. Please review your documents and reapply.'}</p>
        </div>
      )}

      {/* 2. Stats Row */}
      {config?.widgets?.stats?.visible && (
        <StatsCard 
          connectionStatus={connectionStatus?.status} 
          complaintStatus={complaintData?.status} 
          kycStatus={kycData?.kycStatus} 
          usageData={usageData}
          config={config.widgets.stats}
        />
      )}

      {/* 3. Main Grid */}
      <div className="dash-grid-top">
        {config?.widgets?.withdrawalInfo?.visible && (
          <div className="dash-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #EA580C', padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ color: '#111827', margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600' }}>Withdrawal Summary</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Status</p>
                <p style={{ fontWeight: '600', color: '#EA580C', margin: 0, fontSize: '16px' }}>Withdrawn</p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Application ID</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{connectionStatus?.applicationId || (connectionStatus?._id ? `APP-${connectionStatus._id.slice(-6).toUpperCase()}` : 'Not Available')}</p>
                  {connectionStatus && <CopyApplicationIdButton id={connectionStatus?.applicationId || (connectionStatus?._id ? `APP-${connectionStatus._id.slice(-6).toUpperCase()}` : '')} />}
                </div>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Withdrawn By</p>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>Customer</p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Withdrawal Date</p>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>
                  {connectionStatus?.withdrawnAt ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(connectionStatus.withdrawnAt)).replace(',', ' •') : 'Not Available'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 4px 0' }}>Reason</p>
                <p style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>{connectionStatus?.withdrawalReason || 'Customer Request'}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>ℹ️</span>
              <p style={{ margin: 0, color: '#1E3A8A', fontSize: '14px', fontWeight: '500' }}>
                You may submit a new electricity connection application whenever required. Your previous request has been permanently closed.
              </p>
            </div>
          </div>
        )}
        {config?.widgets?.timeline?.visible && <TimelineCard status={connectionStatus} config={config.widgets.timeline} />}
        {config?.widgets?.quickActions?.visible && <QuickActions config={config.widgets.quickActions} refreshData={fetchAllData} />}
      </div>

      <div className="dash-grid-main">
        {config?.widgets?.energy?.visible && <EnergyPreview usageData={usageData} config={config.widgets.energy} />}
        {config?.widgets?.notifications?.visible && <ActivityCard activities={activities} config={config.widgets.notifications} />}
      </div>
    </div>
  );
}

export default HomePage;