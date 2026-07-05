// src/pages/HomePage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  DashboardHeader,
  StatsCard,
  QuickActions,
  TimelineCard,
  EnergyPreview,
  ActivityCard
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
      // Parallel API fetching to optimize load times
      const [dashRes, connRes, usageRes, complaintRes] = await Promise.allSettled([
        api.get('/users/dashboard'),
        api.get('/connections/my-request'),
        api.get('/users/usage'),
        api.get('/users/helpdesk')
      ]);

      let meterNumber = null;

      // Extract Dashboard Data
      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value.data);
        meterNumber = dashRes.value.data.meterNumber;
      }

      // Extract Connection Request Data
      if (connRes.status === 'fulfilled') {
        setConnectionStatus(connRes.value.data);
      } else {
        setConnectionStatus({ status: 'Not Applied' });
      }

      // Extract Usage Data
      if (usageRes.status === 'fulfilled') {
        setUsageData(usageRes.value.data);
      }

      // Extract Complaint Data
      if (complaintRes.status === 'fulfilled') {
        setComplaintData(complaintRes.value.data);
      }

      // Fetch KYC only if we got a meter number
      if (meterNumber) {
        try {
          const kycRes = await api.get(`/users/kyc-status?meter=${meterNumber}`);
          setKycData(kycRes.data);
        } catch (error) {
          // It's expected to fail if user hasn't submitted KYC
          setKycData({ kycStatus: 'Pending' });
        }
      } else {
        setKycData({ kycStatus: 'Pending' });
      }

      // Generate Activity Log
      generateActivities(connRes, complaintRes, dashRes, meterNumber);

      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setStatusLoading(false);
      setLoading(false);
    }
  }, [user?.token]);

  // 3. Activity generation logic based on statuses
  const generateActivities = (connRes, complaintRes, dashRes, meter) => {
    const newActivities = [];
    
    // Login Activity
    newActivities.push({
      type: 'info',
      message: 'Secure login successful.',
      date: new Date().toLocaleDateString()
    });

    // Connection Activity
    if (connRes.status === 'fulfilled' && connRes.value.data && connRes.value.data.status !== 'Not Applied') {
      const connStat = connRes.value.data.status;
      newActivities.push({
        type: connStat === 'Completed' || connStat === 'Meter Installed' ? 'success' : 'pending',
        message: `Connection request is currently: ${connStat}`,
        date: connRes.value.data.assignmentDate ? new Date(connRes.value.data.assignmentDate).toLocaleDateString() : 'Recent'
      });
    }

    // Complaint Activity
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
    return <div className="dash-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }
  if (!user) return null;

  // Calculate estimated bill based on the most recent usage data
  let estimatedBill = 0;
  if (usageData && usageData.length > 0) {
    // Assuming simple calculation: usage * 7 INR per unit
    const latestUsage = usageData[usageData.length - 1].units;
    estimatedBill = (latestUsage * 7).toFixed(2);
  }

  return (
    <div className="dash-container">
      {/* 1. Header Section */}
      <DashboardHeader 
        name={dashboardData?.name} 
        refreshData={fetchAllData} 
        loading={statusLoading} 
        lastChecked={lastChecked} 
      />

      {/* 2. Stats Row */}
      <StatsCard 
        connectionStatus={connectionStatus?.status} 
        complaintStatus={complaintData ? complaintData.status : null} 
        kycStatus={kycData ? kycData.kycStatus : null} 
        estimatedBill={estimatedBill} 
      />

      {/* 3. Main Grid */}
      <div className="dash-grid-top">
        {/* Connection Timeline (Takes 2/3 width) */}
        <TimelineCard status={connectionStatus} />
        
        {/* Quick Actions (Takes 1/3 width) */}
        <QuickActions />
      </div>

      <div className="dash-grid-main">
        {/* Energy Preview (Takes 2/3 width) */}
        <EnergyPreview usageData={usageData} />

        {/* Activity Card (Takes 1/3 width) */}
        <ActivityCard activities={activities} />
      </div>
    </div>
  );
}

export default HomePage;