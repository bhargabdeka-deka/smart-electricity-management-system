import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));
  const token    = userData?.token;
  const headers  = { Authorization: `Bearer ${token}` };

  const [stats,       setStats]       = useState(null);
  const [recentApps,  setRecentApps]  = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loadingStats, setLoadingStats]   = useState(true);

  // ── Fetch all dashboard data ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    Promise.all([
      axios.get('/api/admin/stats',        { headers }),
      axios.get('/api/admin/applications', { headers }),
      axios.get('/api/admin/tickets',      { headers }),
    ])
      .then(([statsRes, appsRes, ticketsRes]) => {
        setStats(statsRes.data);
        setRecentApps(appsRes.data.slice(0, 5));
        setRecentTickets(ticketsRes.data.slice(0, 5));
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoadingStats(false));
    // eslint-disable-next-line
  }, []);

  // ── Status badge helper ───────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      'Pending':           'badge-pending',
      'Under Review':      'badge-review',
      'Approved':          'badge-approved',
      'Rejected':          'badge-rejected',
      'Withdrawn':         'badge-withdrawn',
      'Engineer Assigned': 'badge-assigned',
      'Visit Scheduled':   'badge-assigned',
      'Meter Installed':   'badge-completed',
      'Completed':         'badge-completed',
    };
    return map[status] || 'badge-pending';
  };

  const ticketStatusBadge = (status) => {
    const map = {
      Pending:  'badge-pending',
      Replied:  'badge-approved',
      Resolved: 'badge-completed',
    };
    return map[status] || 'badge-pending';
  };

  // ── Date helper ───────────────────────────────────────────────────────────
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── Status-distribution mini-chart data ──────────────────────────────────
  const chartData = stats
    ? [
        { label: 'Pending',  value: stats.applications.pending,  color: '#F59E0B' },
        { label: 'Approved', value: stats.applications.approved, color: '#10B981' },
        { label: 'Rejected', value: stats.applications.rejected, color: '#EF4444' },
        { label: 'Completed',value: stats.applications.completed,color: '#6366F1' },
        { label: 'Assigned', value: stats.applications.engineerAssigned, color: '#3B82F6' },
      ]
    : [];

  const chartTotal = chartData.reduce((s, d) => s + d.value, 0) || 1;

  // Build conic-gradient string for pie chart
  let cumulative = 0;
  const conicSegments = chartData.map(({ value, color }) => {
    const pct    = (value / chartTotal) * 100;
    const start  = cumulative;
    cumulative  += pct;
    return `${color} ${start.toFixed(1)}% ${cumulative.toFixed(1)}%`;
  });
  const pieStyle = {
    background: `conic-gradient(${conicSegments.join(', ')})`
  };

  if (!userData?.token) {
    return <p style={{ padding: '2rem', color: 'red' }}>⛔ Access denied.</p>;
  }

  return (
    <div className="adm-root">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Admin Control Panel</h1>
          <p className="adm-subtitle">
            Smart Electricity Management System &nbsp;|&nbsp;
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="adm-welcome-chip">
          <span className="adm-welcome-dot" />
          <span>
            <strong>{userData?.name || userData?.email || 'Admin'}</strong>
            <small> · {userData?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</small>
          </span>
        </div>
      </div>

      {/* ── Statistics Grid ──────────────────────────────────────────────── */}
      {loadingStats ? (
        <div className="adm-loading">
          <div className="adm-spinner" />
          <span>Loading dashboard data…</span>
        </div>
      ) : (
        <>
          <section className="adm-stats-grid">
            <StatCard label="Total Applications" value={stats?.applications?.total ?? 0} icon="📋" color="blue" link="/admin/connections" />
            <StatCard label="Pending Review"     value={stats?.applications?.pending ?? 0} icon="⏳" color="amber" link="/admin/connections" />
            <StatCard label="Approved"           value={stats?.applications?.approved ?? 0} icon="✅" color="green" link="/admin/connections" />
            <StatCard label="Rejected"           value={stats?.applications?.rejected ?? 0} icon="❌" color="red" link="/admin/connections" />
            <StatCard label="Withdrawn"          value={stats?.applications?.withdrawn ?? 0} icon="↩️" color="gray" link="/admin/connections" />
            <StatCard label="Completed"          value={stats?.applications?.completed ?? 0} icon="🏠" color="indigo" link="/admin/connections" />
            <StatCard label="Pending KYC"        value={stats?.kyc?.pending ?? 0} icon="📄" color="orange" link="/admin/kyc-review" />
            <StatCard label="Open Complaints"    value={stats?.tickets?.open ?? 0} icon="🆘" color="red" link="/admin/helpdesk" />
          </section>

          {/* ── Main Content Area ─────────────────────────────────────────── */}
          <div className="adm-content-row">

            {/* Recent Applications Table */}
            <div className="adm-card adm-card--wide">
              <div className="adm-card-header">
                <h2 className="adm-card-title">Recent Applications</h2>
                <Link to="/admin/connections" className="adm-see-all">View All →</Link>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Applicant</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.length === 0 ? (
                      <tr><td colSpan={5} className="adm-empty">No applications yet</td></tr>
                    ) : recentApps.map(app => (
                      <tr
                        key={app._id}
                        className="adm-table-row"
                        onClick={() => navigate(`/admin/connections/${app._id}`)}
                        title="Click to view details"
                      >
                        <td className="adm-app-id">{app.applicationId || app._id?.slice(-6)}</td>
                        <td>{app.fullName}</td>
                        <td>{app.userType}</td>
                        <td>{fmtDate(app.createdAt)}</td>
                        <td><span className={`adm-badge ${statusBadge(app.status)}`}>{app.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status Distribution + Quick Actions column */}
            <div className="adm-side-col">

              {/* Pie Chart */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <h2 className="adm-card-title">Status Distribution</h2>
                </div>
                <div className="adm-pie-wrap">
                  <div className="adm-pie" style={pieStyle}>
                    <div className="adm-pie-hole">
                      <span className="adm-pie-total">{chartTotal}</span>
                      <small>Total</small>
                    </div>
                  </div>
                  <ul className="adm-legend">
                    {chartData.map(d => (
                      <li key={d.label} className="adm-legend-item">
                        <span className="adm-legend-dot" style={{ background: d.color }} />
                        <span>{d.label}</span>
                        <strong>{d.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="adm-card">
                <div className="adm-card-header">
                  <h2 className="adm-card-title">Quick Actions</h2>
                </div>
                <div className="adm-quick-actions">
                  <Link to="/admin/connections" className="adm-qa-btn adm-qa-blue">
                    <span>📥</span> Review Applications
                    {stats?.applications?.pending > 0 && (
                      <span className="adm-qa-badge">{stats.applications.pending}</span>
                    )}
                  </Link>
                  <Link to="/admin/helpdesk" className="adm-qa-btn adm-qa-amber">
                    <span>🆘</span> Handle Complaints
                    {stats?.tickets?.open > 0 && (
                      <span className="adm-qa-badge">{stats.tickets.open}</span>
                    )}
                  </Link>
                  <Link to="/admin/kyc-review" className="adm-qa-btn adm-qa-orange">
                    <span>📄</span> Verify KYC
                    {stats?.kyc?.pending > 0 && (
                      <span className="adm-qa-badge">{stats.kyc.pending}</span>
                    )}
                  </Link>
                  <Link to="/admin/reports" className="adm-qa-btn adm-qa-indigo">
                    <span>📊</span> View Reports
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Tickets ──────────────────────────────────────────── */}
          <div className="adm-card" style={{ marginTop: '1.5rem' }}>
            <div className="adm-card-header">
              <h2 className="adm-card-title">Recent Helpdesk Tickets</h2>
              <Link to="/admin/helpdesk" className="adm-see-all">View All →</Link>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Meter No.</th>
                    <th>Issue</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.length === 0 ? (
                    <tr><td colSpan={5} className="adm-empty">No tickets yet</td></tr>
                  ) : recentTickets.map(t => (
                    <tr key={t._id} className="adm-table-row">
                      <td className="adm-app-id">#{t._id?.slice(-6).toUpperCase()}</td>
                      <td>{t.meterNumber}</td>
                      <td className="adm-issue-cell">{t.issueText}</td>
                      <td>{fmtDate(t.createdAt)}</td>
                      <td><span className={`adm-badge ${ticketStatusBadge(t.status)}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Sub-component: Stat Card ──────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, link }) => (
  <Link to={link} className={`adm-stat-card adm-stat-${color}`}>
    <div className="adm-stat-icon">{icon}</div>
    <div className="adm-stat-body">
      <div className="adm-stat-value">{value}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  </Link>
);

export default AdminDashboard;