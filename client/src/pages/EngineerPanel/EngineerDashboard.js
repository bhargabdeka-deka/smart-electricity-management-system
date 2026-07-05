// src/pages/EngineerPanel/EngineerDashboard.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EngineerPanel.css';

export default function EngineerDashboard() {
  const navigate  = useNavigate();
  const stored    = JSON.parse(localStorage.getItem('user')) || {};
  const { token, name } = stored;

  const [stats, setStats]     = useState({
    assigned:    0,
    pending:     0,
    todayVisits: 0,
    completed:   0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    axios
      .get('/api/engineer/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const jobs      = res.data;
        const today     = new Date().toISOString().slice(0, 10);

        const pending   = jobs.filter(j =>
          ['Engineer Assigned', 'Visit Scheduled', 'Installation In Progress']
            .includes(j.status)
        ).length;

        const todayV    = jobs.filter(j =>
          j.visitDate && j.visitDate.slice(0, 10) === today
        ).length;

        const completed = jobs.filter(j =>
          ['Meter Installed', 'Completed'].includes(j.status)
        ).length;

        setStats({
          assigned:    jobs.length,
          pending,
          todayVisits: todayV,
          completed
        });
      })
      .catch(err => console.error('❌ Stats fetch error:', err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="engineer-container">
      <div className="engineer-header">
        <h2>🔧 Engineer Dashboard</h2>
        <p>Welcome back, <strong>{name || 'Engineer'}</strong>. Here is your work summary.</p>
      </div>

      {/* ── Statistics ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Assigned</span>
          <span className="stat-value">{loading ? '…' : stats.assigned}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Visits</span>
          <span className="stat-value">{loading ? '…' : stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today's Visits</span>
          <span className="stat-value">{loading ? '…' : stats.todayVisits}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{loading ? '…' : stats.completed}</span>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="engineer-grid">
        <div className="engineer-card" onClick={() => navigate('/engineer/jobs')}>
          <div>
            <h3>📋 My Jobs</h3>
            <p>View all connection requests assigned to you. Accept, schedule, and complete installations.</p>
          </div>
          <span className="engineer-action">Open →</span>
        </div>
      </div>
    </div>
  );
}
