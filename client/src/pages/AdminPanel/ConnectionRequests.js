import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ConnectionRequests.css';

const ConnectionRequests = () => {
  const [requests, setRequests]   = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  // Track which engineer is selected per card: { [requestId]: engineerId }
  const [selectedEngineer, setSelectedEngineer] = useState({});
  // Track assigning state per card to disable button while saving
  const [assigning, setAssigning] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));

  // ─── Fetch connection requests ───────────────────────────────────────────────
  const fetchRequests = async () => {
    if (!user?.token || user?.role !== 'admin') {
      setError('⛔ Access denied. Admin role required.');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('/api/admin/applications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || '❗ Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch all field engineers (called once on mount) ────────────────────────
  const fetchEngineers = async () => {
    try {
      const res = await axios.get('/api/admin/engineers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEngineers(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch engineers:', err.message);
    }
  };

  useEffect(() => {
    if (user?.token && user?.role === 'admin') {
      fetchRequests();
      fetchEngineers();
    }
    // eslint-disable-next-line
  }, []);

  // ─── Existing: Approve / Reject ──────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/applications/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(`✅ Application ${status} successfully!`);
      fetchRequests();
    } catch (err) {
      alert('⚠️ Failed to update application.');
    }
  };

  // ─── New: Assign Engineer ─────────────────────────────────────────────────────
  const handleAssignEngineer = async (requestId) => {
    const engineerId = selectedEngineer[requestId];
    if (!engineerId) {
      return alert('⚠️ Please select an engineer first.');
    }
    setAssigning(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await axios.put(
        `/api/admin/applications/${requestId}/assign`,
        { engineerId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`✅ ${res.data.message}`);
      // Clear the selection for this card and refresh
      setSelectedEngineer(prev => ({ ...prev, [requestId]: '' }));
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || '⚠️ Failed to assign engineer.');
    } finally {
      setAssigning(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // ─── Helper: status badge class ──────────────────────────────────────────────
  const statusClass = (status) => {
    if (status === 'Approved')           return 'status-approved';
    if (status === 'Rejected')           return 'status-rejected';
    if (status === 'Engineer Assigned')  return 'status-assigned';
    if (status === 'Completed' || status === 'Meter Installed') return 'status-completed';
    return '';
  };

  // ─── Partition requests into buckets ─────────────────────────────────────────
  const pending  = requests.filter(r => r.status?.trim() === 'Pending');

  // "Approved" cards still need engineer assignment
  const approved = requests.filter(r => r.status?.trim() === 'Approved');

  // Everything else that is neither Pending nor Approved
  const processed = requests.filter(r => {
    const s = r.status?.trim();
    return s !== 'Pending' && s !== 'Approved';
  });

  return (
    <div className="request-dashboard">

      {/* ── 🟡 Pending Panel ─────────────────────────────────────────────────── */}
      <div className="pending-section">
        <h3>📋 Pending Connection Requests</h3>

        {loading ? (
          <p>🔄 Loading...</p>
        ) : error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
        ) : pending.length === 0 ? (
          <p>✅ No pending requests.</p>
        ) : (
          pending.map((r) => (
            <div key={r._id} className="request-card">
              <p><strong>Name:</strong> {r.fullName}</p>
              <p><strong>Type:</strong> {r.userType}</p>
              <p><strong>Address:</strong> {r.address}</p>
              <p><strong>Pincode:</strong> {r.pincode}</p>
              <p><strong>Meter:</strong> {r.meterType}</p>
              <p><strong>Meter Number:</strong> {r.meterNumber}</p>
              <p><strong>Load:</strong> {r.load} kW</p>
              <p><strong>Submitted:</strong> {r.createdAt?.slice(0, 10)}</p>

              <div className="request-actions">
                <button className="btn-approve" onClick={() => updateStatus(r._id, 'Approved')}>
                  ✅ Approve
                </button>
                <button className="btn-reject" onClick={() => updateStatus(r._id, 'Rejected')}>
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        )}

        {/* ── ✅ Approved — Awaiting Engineer Assignment ──────────────────────── */}
        {!loading && approved.length > 0 && (
          <>
            <h3 style={{ marginTop: '1.5rem' }}>✅ Approved — Assign Field Engineer</h3>
            {approved.map((r) => (
              <div key={r._id} className="request-card">
                <p><strong>Name:</strong> {r.fullName}</p>
                <p><strong>Address:</strong> {r.address}, {r.pincode}</p>
                <p><strong>Meter Number:</strong> {r.meterNumber}</p>
                <p><strong>Load:</strong> {r.load} kW</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="status-approved">{r.status}</span>
                </p>
                <p><strong>Approved On:</strong> {r.decisionDate?.slice(0, 10) || '—'}</p>

                {/* ── Engineer Assignment UI ───────────────────────────────── */}
                <div className="assign-section">
                  <label>👷 Assign Field Engineer:</label>
                  <select
                    value={selectedEngineer[r._id] || ''}
                    onChange={(e) =>
                      setSelectedEngineer(prev => ({ ...prev, [r._id]: e.target.value }))
                    }
                  >
                    <option value="">— Select Engineer —</option>
                    {engineers.length === 0 ? (
                      <option disabled>No engineers registered</option>
                    ) : (
                      engineers.map(eng => (
                        <option key={eng._id} value={eng._id}>
                          {eng.name} ({eng.email})
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    className="btn-assign"
                    onClick={() => handleAssignEngineer(r._id)}
                    disabled={!selectedEngineer[r._id] || assigning[r._id]}
                  >
                    {assigning[r._id] ? '⏳ Assigning...' : '🔧 Assign Engineer'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── 📁 Processed Panel ──────────────────────────────────────────────── */}
      <div className="processed-section">
        <h3>📁 Processed Applications</h3>
        {processed.length === 0 ? (
          <p>📭 No processed requests.</p>
        ) : (
          processed.map((r) => (
            <div key={r._id} className="request-card processed">
              <p><strong>Name:</strong> {r.fullName}</p>
              <p><strong>Contact:</strong> {r.contact}</p>
              <p><strong>Pincode:</strong> {r.pincode}</p>
              <p><strong>Meter:</strong> {r.meterType}</p>
              <p><strong>Meter Number:</strong> {r.meterNumber}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={statusClass(r.status)}>{r.status}</span>
              </p>
              <p><strong>Decision Date:</strong> {r.decisionDate?.slice(0, 10) || '—'}</p>
              {r.assignmentDate && (
                <p><strong>Assigned On:</strong> {r.assignmentDate?.slice(0, 10)}</p>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ConnectionRequests;