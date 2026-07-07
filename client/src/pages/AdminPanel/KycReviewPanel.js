import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './KycReviewPanel.css';

const DOC_BASE = 'http://localhost:5000/';

const KycReviewPanel = () => {
  const user    = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${user?.token}` };

  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Remarks state per card: { [kycId]: string }
  const [remarksMap, setRemarksMap] = useState({});
  const [deciding,   setDeciding]   = useState({});

  // Filter
  const [filterStatus, setFilterStatus] = useState('Pending');

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchKycSubmissions = async () => {
    try {
      const res = await axios.get('/api/admin/kyc-requests', { headers });
      setKycList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch KYC requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token && user?.role === 'admin') {
      fetchKycSubmissions();
    }
    // eslint-disable-next-line
  }, []);

  // ── Decision ─────────────────────────────────────────────────────────────
  const handleDecision = async (kycId, status) => {
    const remarks = remarksMap[kycId]?.trim() || '';
    setDeciding(prev => ({ ...prev, [kycId]: status }));
    try {
      await axios.put(
        `/api/admin/kyc-status/${kycId}`,
        { status, remarks },
        { headers }
      );
      toast.success(`KYC ${status} successfully!`);
      setRemarksMap(prev => ({ ...prev, [kycId]: '' }));
      fetchKycSubmissions();
    } catch (err) {
      toast.error('Failed to update KYC status.');
      console.error(err);
    } finally {
      setDeciding(prev => ({ ...prev, [kycId]: null }));
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const badgeClass = (s) => {
    if (s === 'Approved') return 'kyc-badge--approved';
    if (s === 'Rejected') return 'kyc-badge--rejected';
    return 'kyc-badge--pending';
  };

  // Summary stats
  const stats = {
    total:    kycList.length,
    pending:  kycList.filter(k => k.kycStatus === 'Pending').length,
    approved: kycList.filter(k => k.kycStatus === 'Approved').length,
    rejected: kycList.filter(k => k.kycStatus === 'Rejected').length,
  };

  const filtered = filterStatus
    ? kycList.filter(k => k.kycStatus === filterStatus)
    : kycList;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="kyc-root">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="kyc-page-header">
        <div>
          <h1 className="kyc-page-title">KYC Verification Dashboard</h1>
          <p className="kyc-page-sub">
            {filtered.length} submission{filtered.length !== 1 ? 's' : ''} {filterStatus ? `· ${filterStatus}` : '· All'}
          </p>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="kyc-stats-row">
        {[
          { label: 'Total',    val: stats.total,    color: 'gray',  filter: '' },
          { label: 'Pending',  val: stats.pending,  color: 'amber', filter: 'Pending' },
          { label: 'Approved', val: stats.approved, color: 'green', filter: 'Approved' },
          { label: 'Rejected', val: stats.rejected, color: 'red',   filter: 'Rejected' },
        ].map(({ label, val, color, filter }) => (
          <button
            key={label}
            className={`kyc-stat kyc-stat--${color} ${filterStatus === filter ? 'kyc-stat--active' : ''}`}
            onClick={() => setFilterStatus(filter)}
          >
            <span className="kyc-stat-val">{val}</span>
            <span className="kyc-stat-label">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="kyc-loading">
          <div className="kyc-spinner" />
          <span>Loading KYC submissions…</span>
        </div>
      ) : error ? (
        <div className="kyc-error">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="kyc-empty">
          <span>📭</span>
          <p>No {filterStatus.toLowerCase()} KYC submissions.</p>
        </div>
      ) : (
        <div className="kyc-grid">
          {filtered.map(entry => {
            const isDeciding = deciding[entry._id];
            return (
              <div key={entry._id} className="kyc-card">

                {/* Card Header */}
                <div className="kyc-card-header">
                  <div className="kyc-avatar">
                    {entry.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="kyc-card-info">
                    <div className="kyc-card-name">{entry.fullName}</div>
                    <div className="kyc-card-meter">Meter: {entry.meterNumber}</div>
                  </div>
                  <span className={`kyc-badge ${badgeClass(entry.kycStatus)}`}>
                    {entry.kycStatus}
                  </span>
                </div>

                <div className="kyc-card-body">
                  {/* Identity Numbers */}
                  <div className="kyc-id-row">
                    <div className="kyc-id-item">
                      <span className="kyc-id-label">Aadhaar Number</span>
                      <span className="kyc-id-val">{entry.aadhaarNumber}</span>
                    </div>
                    <div className="kyc-id-item">
                      <span className="kyc-id-label">PAN Number</span>
                      <span className="kyc-id-val">{entry.panNumber}</span>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="kyc-docs">
                    <div className="kyc-docs-label">📎 Uploaded Documents</div>
                    <div className="kyc-doc-row">
                      <div className="kyc-doc-item">
                        <span>🪪 Aadhaar Copy</span>
                        {entry.docs?.aadhaar ? (
                          <a
                            href={`${DOC_BASE}${entry.docs.aadhaar}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="kyc-doc-link"
                          >
                            View ↗
                          </a>
                        ) : (
                          <span className="kyc-doc-missing">Not uploaded</span>
                        )}
                      </div>
                      <div className="kyc-doc-item">
                        <span>🏠 Ownership Proof</span>
                        {entry.docs?.proof ? (
                          <a
                            href={`${DOC_BASE}${entry.docs.proof}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="kyc-doc-link"
                          >
                            View ↗
                          </a>
                        ) : (
                          <span className="kyc-doc-missing">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Existing Decision Info */}
                  {entry.decisionDate && (
                    <div className="kyc-decision-info">
                      <span>Decision: {fmtDate(entry.decisionDate)}</span>
                      {entry.adminRemarks && <span>Remarks: {entry.adminRemarks}</span>}
                    </div>
                  )}

                  {/* Action Area — only for Pending */}
                  {entry.kycStatus === 'Pending' && (
                    <div className="kyc-action-area">
                      <textarea
                        className="kyc-remarks-input"
                        placeholder="Add verification notes or rejection reason…"
                        rows={2}
                        value={remarksMap[entry._id] || ''}
                        onChange={e =>
                          setRemarksMap(prev => ({ ...prev, [entry._id]: e.target.value }))
                        }
                      />
                      <div className="kyc-action-btns">
                        <button
                          className="kyc-btn kyc-btn--approve"
                          disabled={!!isDeciding}
                          onClick={() => handleDecision(entry._id, 'Approved')}
                        >
                          {isDeciding === 'Approved' ? 'Approving…' : '✅ Approve KYC'}
                        </button>
                        <button
                          className="kyc-btn kyc-btn--reject"
                          disabled={!!isDeciding}
                          onClick={() => handleDecision(entry._id, 'Rejected')}
                        >
                          {isDeciding === 'Rejected' ? 'Rejecting…' : '❌ Reject KYC'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KycReviewPanel;