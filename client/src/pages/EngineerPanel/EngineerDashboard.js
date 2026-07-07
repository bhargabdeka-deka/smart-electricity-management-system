import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EngineerPanel.css';

export default function EngineerDashboard() {
  const navigate  = useNavigate();
  const stored    = JSON.parse(localStorage.getItem('user')) || {};
  const { token, name } = stored;

  const [stats, setStats] = useState({
    todaysJobs: 0,
    pendingAcceptance: 0,
    todaysVisits: 0,
    inProgress: 0,
    completedToday: 0,
    totalPending: 0
  });

  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get('/api/engineer/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const jobs = res.data;
        const today = new Date().toISOString().slice(0, 10);

        // Calculate Stats
        const todaysJobs = jobs.filter(j => j.visitDate && j.visitDate.slice(0, 10) === today).length;
        const pendingAcceptance = jobs.filter(j => j.status === 'Engineer Assigned').length;
        const todaysVisits = jobs.filter(j => j.status === 'Visit Scheduled' && j.visitDate && j.visitDate.slice(0, 10) === today).length;
        const inProgress = jobs.filter(j => j.status === 'Installation In Progress').length;
        const completedToday = jobs.filter(j => 
          (j.status === 'Completed' || j.status === 'Meter Installed') && 
          j.installationDate && j.installationDate.slice(0, 10) === today
        ).length;
        const totalPending = jobs.filter(j => ['Engineer Assigned', 'Visit Scheduled', 'Installation In Progress'].includes(j.status)).length;

        setStats({ todaysJobs, pendingAcceptance, todaysVisits, inProgress, completedToday, totalPending });

        // Calculate Upcoming Visits
        const upcoming = jobs
          .filter(j => j.status === 'Visit Scheduled' && j.visitDate)
          .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))
          .slice(0, 5);
        setUpcomingVisits(upcoming);

        // Calculate Recent Completed
        const recent = jobs
          .filter(j => j.status === 'Completed' || j.status === 'Meter Installed')
          .sort((a, b) => new Date(b.installationDate || b.updatedAt) - new Date(a.installationDate || a.updatedAt))
          .slice(0, 5);
        setRecentCompleted(recent);

      })
      .catch(err => {
        console.error('❌ Stats fetch error:', err.message);
        setError('Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const badgeClass = (status) => {
    switch (status) {
      case 'Engineer Assigned': return 'status-assigned';
      case 'Visit Scheduled': return 'status-scheduled';
      case 'Installation In Progress': return 'status-inprogress';
      case 'Meter Installed':
      case 'Completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="engineer-container cr-admin-container">
      <div className="cr-top-header">
        <div>
          <h2>🔧 Field Engineer Dashboard</h2>
          <p>Welcome back, <strong>{name || 'Engineer'}</strong>. Here is your daily work summary.</p>
        </div>
        <button className="cr-btn cr-btn--approve" onClick={() => navigate('/engineer/jobs')}>
          Open My Jobs
        </button>
      </div>

      {error && <div className="cr-error-msg">{error}</div>}

      {/* ── Statistics Grid ── */}
      <div className="eng-stat-grid">
        <div className="eng-stat-card">
          <div className="eng-stat-title">Today's Jobs</div>
          <div className="eng-stat-value">{loading ? '…' : stats.todaysJobs}</div>
        </div>
        <div className="eng-stat-card">
          <div className="eng-stat-title">Pending Acceptance</div>
          <div className="eng-stat-value eng-text-warning">{loading ? '…' : stats.pendingAcceptance}</div>
        </div>
        <div className="eng-stat-card">
          <div className="eng-stat-title">Today's Visits</div>
          <div className="eng-stat-value">{loading ? '…' : stats.todaysVisits}</div>
        </div>
        <div className="eng-stat-card">
          <div className="eng-stat-title">In Progress</div>
          <div className="eng-stat-value eng-text-info">{loading ? '…' : stats.inProgress}</div>
        </div>
        <div className="eng-stat-card">
          <div className="eng-stat-title">Completed Today</div>
          <div className="eng-stat-value eng-text-success">{loading ? '…' : stats.completedToday}</div>
        </div>
        <div className="eng-stat-card">
          <div className="eng-stat-title">Total Pending Jobs</div>
          <div className="eng-stat-value">{loading ? '…' : stats.totalPending}</div>
        </div>
      </div>

      {/* ── Lists Grid ── */}
      <div className="eng-lists-layout">
        {/* Upcoming Visits */}
        <div className="eng-list-card">
          <div className="eng-list-header">
            <h3>Upcoming Visits</h3>
          </div>
          <div className="eng-list-body">
            {loading ? (
              <p className="eng-empty">Loading...</p>
            ) : upcomingVisits.length === 0 ? (
              <p className="eng-empty">No upcoming visits scheduled.</p>
            ) : (
              upcomingVisits.map(job => (
                <div key={job._id} className="eng-list-item">
                  <div className="eng-list-item-main">
                    <strong>{job.fullName}</strong>
                    <span>{job.address}</span>
                  </div>
                  <div className="eng-list-item-meta">
                    <span className={`job-status ${badgeClass(job.status)}`}>{job.status}</span>
                    <span className="eng-date">{new Date(job.visitDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Completed */}
        <div className="eng-list-card">
          <div className="eng-list-header">
            <h3>Recent Completed Jobs</h3>
          </div>
          <div className="eng-list-body">
            {loading ? (
              <p className="eng-empty">Loading...</p>
            ) : recentCompleted.length === 0 ? (
              <p className="eng-empty">No recent completed jobs.</p>
            ) : (
              recentCompleted.map(job => (
                <div key={job._id} className="eng-list-item">
                  <div className="eng-list-item-main">
                    <strong>{job.fullName}</strong>
                    <span>{job.meterSerialNumber ? `Meter: ${job.meterSerialNumber}` : job.address}</span>
                  </div>
                  <div className="eng-list-item-meta">
                    <span className={`job-status ${badgeClass(job.status)}`}>{job.status}</span>
                    <span className="eng-date">
                      {job.installationDate ? new Date(job.installationDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
