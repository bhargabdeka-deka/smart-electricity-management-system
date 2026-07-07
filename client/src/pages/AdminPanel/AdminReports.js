import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminReports.css';

const AdminReports = () => {
  const user    = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${user?.token}` };

  const [stats,   setStats]   = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/stats',        { headers }),
      axios.get('/api/admin/applications', { headers }),
    ])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes.data);
        setAllApps(appsRes.data);
      })
      .catch(err => console.error('Reports fetch error:', err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  // ── Monthly Bar Chart Data ─────────────────────────────────────────────────
  const monthlyData = React.useMemo(() => {
    if (!allApps.length) return [];
    const map = {};
    allApps.forEach(app => {
      if (!app.createdAt) return;
      const d   = new Date(app.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key]  = (map[key] || 0) + 1;
    });
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    const maxVal = Math.max(...sorted.map(([, v]) => v), 1);
    return sorted.map(([key, count]) => {
      const [year, month] = key.split('-');
      const label = new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      return { label, count, pct: Math.round((count / maxVal) * 100) };
    });
  }, [allApps]);

  // ── Status Pie Chart ────────────────────────────────────────────────────────
  const pieData = stats
    ? [
        { label: 'Pending',  value: stats.applications.pending,  color: '#F59E0B' },
        { label: 'Approved', value: stats.applications.approved, color: '#10B981' },
        { label: 'Rejected', value: stats.applications.rejected, color: '#EF4444' },
        { label: 'Assigned', value: stats.applications.engineerAssigned, color: '#3B82F6' },
        { label: 'Completed',value: stats.applications.completed,color: '#6366F1' },
        { label: 'Withdrawn',value: stats.applications.withdrawn,color: '#9CA3AF' },
      ].filter(d => d.value > 0)
    : [];

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const conicSegments = pieData.map(({ value, color }) => {
    const pct    = (value / pieTotal) * 100;
    const start  = cumulative;
    cumulative  += pct;
    return `${color} ${start.toFixed(1)}% ${cumulative.toFixed(1)}%`;
  });

  if (loading) {
    return (
      <div className="rpt-root">
        <div className="rpt-loading">
          <div className="rpt-spinner" />
          <span>Loading reports…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rpt-root">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="rpt-page-header">
        <div>
          <h1 className="rpt-page-title">Reports & Analytics</h1>
          <p className="rpt-page-sub">System-wide performance statistics</p>
        </div>
        <div className="rpt-generated">
          Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────────── */}
      <div className="rpt-summary-grid">
        <SummaryCard label="Total Applications"  value={stats?.applications?.total ?? 0}   color="blue" />
        <SummaryCard label="Pending Review"       value={stats?.applications?.pending ?? 0}  color="amber" />
        <SummaryCard label="Approved"             value={stats?.applications?.approved ?? 0} color="green" />
        <SummaryCard label="Rejected"             value={stats?.applications?.rejected ?? 0} color="red" />
        <SummaryCard label="Completed"            value={stats?.applications?.completed ?? 0} color="indigo" />
        <SummaryCard label="Pending KYC"          value={stats?.kyc?.pending ?? 0}           color="orange" />
        <SummaryCard label="Open Tickets"         value={stats?.tickets?.open ?? 0}          color="red" />
        <SummaryCard label="Resolved Tickets"     value={stats?.tickets?.resolved ?? 0}      color="green" />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div className="rpt-charts-row">

        {/* Monthly Bar Chart */}
        <div className="rpt-card rpt-card--wide">
          <div className="rpt-card-header">
            <h2 className="rpt-card-title">📊 Monthly Applications (Last 6 Months)</h2>
          </div>
          <div className="rpt-bar-chart">
            {monthlyData.length === 0 ? (
              <p className="rpt-no-data">No application data yet.</p>
            ) : (
              monthlyData.map(({ label, count, pct }) => (
                <div key={label} className="rpt-bar-row">
                  <div className="rpt-bar-label">{label}</div>
                  <div className="rpt-bar-track">
                    <div
                      className="rpt-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="rpt-bar-val">{count}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="rpt-card">
          <div className="rpt-card-header">
            <h2 className="rpt-card-title">🥧 Status Distribution</h2>
          </div>
          <div className="rpt-pie-wrap">
            {pieData.length > 0 ? (
              <>
                <div
                  className="rpt-pie"
                  style={{ background: `conic-gradient(${conicSegments.join(', ')})` }}
                >
                  <div className="rpt-pie-hole">
                    <span className="rpt-pie-total">{pieTotal}</span>
                    <small>Total</small>
                  </div>
                </div>
                <ul className="rpt-legend">
                  {pieData.map(d => (
                    <li key={d.label} className="rpt-legend-item">
                      <span className="rpt-legend-dot" style={{ background: d.color }} />
                      <span>{d.label}</span>
                      <strong>{d.value}</strong>
                      <small>({((d.value / pieTotal) * 100).toFixed(1)}%)</small>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="rpt-no-data">No data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── KYC + Tickets Summary ────────────────────────────────────────── */}
      <div className="rpt-charts-row" style={{ marginTop: '1.5rem' }}>

        <div className="rpt-card">
          <div className="rpt-card-header">
            <h2 className="rpt-card-title">📄 KYC Statistics</h2>
          </div>
          <div className="rpt-mini-stats">
            <MiniStat label="Pending"  value={stats?.kyc?.pending  ?? 0} color="#F59E0B" />
            <MiniStat label="Approved" value={stats?.kyc?.approved ?? 0} color="#10B981" />
            <MiniStat label="Rejected" value={stats?.kyc?.rejected ?? 0} color="#EF4444" />
          </div>
          {/* KYC Bar */}
          <div className="rpt-ratio-bar-wrap">
            <div className="rpt-ratio-label">
              <span>KYC Approval Rate</span>
              <strong>
                {stats?.kyc?.approved + stats?.kyc?.rejected > 0
                  ? `${Math.round((stats.kyc.approved / (stats.kyc.approved + stats.kyc.rejected)) * 100)}%`
                  : 'N/A'}
              </strong>
            </div>
            <div className="rpt-ratio-track">
              <div
                className="rpt-ratio-fill rpt-ratio-fill--green"
                style={{
                  width: stats?.kyc?.approved + stats?.kyc?.rejected > 0
                    ? `${Math.round((stats.kyc.approved / (stats.kyc.approved + stats.kyc.rejected)) * 100)}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        </div>

        <div className="rpt-card">
          <div className="rpt-card-header">
            <h2 className="rpt-card-title">🆘 Helpdesk Statistics</h2>
          </div>
          <div className="rpt-mini-stats">
            <MiniStat label="Open"     value={stats?.tickets?.open     ?? 0} color="#F59E0B" />
            <MiniStat label="Replied"  value={stats?.tickets?.replied  ?? 0} color="#3B82F6" />
            <MiniStat label="Resolved" value={stats?.tickets?.resolved ?? 0} color="#10B981" />
          </div>
          {/* Resolution Bar */}
          <div className="rpt-ratio-bar-wrap">
            <div className="rpt-ratio-label">
              <span>Resolution Rate</span>
              <strong>
                {(stats?.tickets?.open + stats?.tickets?.replied + stats?.tickets?.resolved) > 0
                  ? `${Math.round((stats.tickets.resolved / (stats.tickets.open + stats.tickets.replied + stats.tickets.resolved)) * 100)}%`
                  : 'N/A'}
              </strong>
            </div>
            <div className="rpt-ratio-track">
              <div
                className="rpt-ratio-fill rpt-ratio-fill--blue"
                style={{
                  width: (stats?.tickets?.open + stats?.tickets?.replied + stats?.tickets?.resolved) > 0
                    ? `${Math.round((stats.tickets.resolved / (stats.tickets.open + stats.tickets.replied + stats.tickets.resolved)) * 100)}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color }) => (
  <div className={`rpt-sum-card rpt-sum-${color}`}>
    <div className="rpt-sum-val">{value}</div>
    <div className="rpt-sum-label">{label}</div>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div className="rpt-mini-stat">
    <span className="rpt-mini-dot" style={{ background: color }} />
    <span className="rpt-mini-label">{label}</span>
    <strong className="rpt-mini-val">{value}</strong>
  </div>
);

export default AdminReports;
