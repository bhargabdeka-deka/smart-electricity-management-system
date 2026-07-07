import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ApplicationDetailPage.css';

const DOC_BASE = 'http://localhost:5000/';

const ApplicationDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const user       = JSON.parse(localStorage.getItem('user'));
  const headers    = { Authorization: `Bearer ${user?.token}` };

  const [app,       setApp]       = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Actions state
  const [actionModal,  setActionModal]  = useState(null); // 'approve' | 'reject'
  const [actionEng,    setActionEng]    = useState('');
  const [actionDate,   setActionDate]   = useState('');
  const [actionRemark, setActionRemark] = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const [adminRemarks,    setAdminRemarks]    = useState('');
  const [savingRemarks,   setSavingRemarks]   = useState(false);
  const [remarksEditing,  setRemarksEditing]  = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchApp = async () => {
    try {
      const [appRes, engRes] = await Promise.all([
        axios.get(`/api/admin/applications/${id}`, { headers }),
        axios.get('/api/admin/engineers',           { headers }),
      ]);
      setApp(appRes.data);
      setAdminRemarks(appRes.data.installationRemarks || '');
      setEngineers(engRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || user?.role !== 'admin') {
      setError('Access denied.');
      setLoading(false);
      return;
    }
    fetchApp();
    // eslint-disable-next-line
  }, [id]);

  // ── Approve Action ───────────────────────────────────────────────────────
  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await axios.put(
        `/api/admin/applications/${id}/status`,
        { status: 'Approved' },
        { headers }
      );
      if (actionEng) {
        await axios.put(
          `/api/admin/applications/${id}/assign`,
          { engineerId: actionEng },
          { headers }
        );
      }
      if (actionRemark.trim()) {
        await axios.put(
          `/api/admin/applications/${id}/remarks`,
          { remarks: actionRemark },
          { headers }
        );
      }
      toast.success('Application approved!');
      setActionModal(null);
      setActionEng('');
      setActionRemark('');
      fetchApp();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reject Action ────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!actionRemark.trim()) {
      return toast.warning('Rejection reason is required.');
    }
    setSubmitting(true);
    try {
      await axios.put(
        `/api/admin/applications/${id}/status`,
        { status: 'Rejected' },
        { headers }
      );
      await axios.put(
        `/api/admin/applications/${id}/remarks`,
        { remarks: actionRemark },
        { headers }
      );
      toast.success('Application rejected.');
      setActionModal(null);
      setActionRemark('');
      fetchApp();
    } catch (err) {
      toast.error('Rejection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Save Remarks ─────────────────────────────────────────────────────────
  const saveRemarks = async () => {
    setSavingRemarks(true);
    try {
      await axios.put(
        `/api/admin/applications/${id}/remarks`,
        { remarks: adminRemarks },
        { headers }
      );
      toast.success('Remarks saved.');
      setRemarksEditing(false);
    } catch (err) {
      toast.error('Failed to save remarks.');
    } finally {
      setSavingRemarks(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const badgeClass = (status) => {
    const map = {
      'Pending':           'adp-badge--pending',
      'Under Review':      'adp-badge--review',
      'Approved':          'adp-badge--approved',
      'Rejected':          'adp-badge--rejected',
      'Withdrawn':         'adp-badge--withdrawn',
      'Engineer Assigned': 'adp-badge--assigned',
      'Meter Installed':   'adp-badge--completed',
      'Completed':         'adp-badge--completed',
    };
    return map[status] || 'adp-badge--pending';
  };

  const timeline = app
    ? [
        { label: 'Application Submitted',  date: app.createdAt,        icon: '📋', done: true },
        { label: 'Under Review',           date: null,                  icon: '🔍', done: ['Under Review','Approved','Rejected','Engineer Assigned','Completed','Meter Installed'].includes(app.status) },
        { label: 'Decision Made',          date: app.decisionDate,      icon: '⚖️', done: !!app.decisionDate },
        { label: 'Engineer Assigned',      date: app.assignmentDate,    icon: '👷', done: !!app.assignedEngineer },
        { label: 'Visit Scheduled',        date: app.visitDate,         icon: '📅', done: !!app.visitDate },
        { label: 'Installation Complete',  date: app.installationDate,  icon: '🔌', done: !!app.installationDate },
        { label: 'Completed',             date: app.completionDate,    icon: '✅', done: app.status === 'Completed' || app.status === 'Meter Installed' },
      ]
    : [];

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="adp-root">
        <div className="adp-loading">
          <div className="adp-spinner" />
          <span>Loading application…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adp-root">
        <div className="adp-error">
          <p>{error}</p>
          <button className="adp-btn adp-btn--secondary" onClick={() => navigate('/admin/connections')}>← Back</button>
        </div>
      </div>
    );
  }

  const engineer = app?.assignedEngineer;

  return (
    <div className="adp-root">

      {/* ── Breadcrumb + Header ─────────────────────────────────────────── */}
      <div className="adp-top-bar">
        <button className="adp-back-btn" onClick={() => navigate('/admin/connections')}>
          ← Connection Requests
        </button>
        <div className="adp-header-right">
          <span className={`adp-badge ${badgeClass(app?.status)}`}>{app?.status}</span>
          {app?.status === 'Pending' && (
            <div className="adp-action-btns">
              <button className="adp-btn adp-btn--approve" onClick={() => setActionModal('approve')}>
                ✅ Approve
              </button>
              <button className="adp-btn adp-btn--reject" onClick={() => setActionModal('reject')}>
                ❌ Reject
              </button>
            </div>
          )}
          <button className="adp-btn adp-btn--print" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ── App ID Banner ───────────────────────────────────────────────── */}
      <div className="adp-banner">
        <div>
          <div className="adp-banner-id">{app?.applicationId}</div>
          <div className="adp-banner-sub">Application ID · Submitted {fmtDate(app?.createdAt)}</div>
        </div>
        <div className="adp-banner-meta">
          <div>
            <span className="adp-meta-label">Meter Number</span>
            <span className="adp-meta-val">{app?.meterNumber}</span>
          </div>
          <div>
            <span className="adp-meta-label">Consumer Type</span>
            <span className="adp-meta-val">{app?.userType}</span>
          </div>
          <div>
            <span className="adp-meta-label">Load</span>
            <span className="adp-meta-val">{app?.load} kW</span>
          </div>
        </div>
      </div>

      {/* ── Content Grid ────────────────────────────────────────────────── */}
      <div className="adp-grid">

        {/* Left column */}
        <div className="adp-col-main">

          {/* Applicant Details */}
          <Section title="Applicant Details" icon="👤">
            <InfoGrid>
              <InfoRow label="Full Name"     value={app?.fullName} />
              <InfoRow label="Email"         value={app?.email} />
              <InfoRow label="Contact"       value={app?.contact} />
              <InfoRow label="Address"       value={app?.address} />
              <InfoRow label="Pincode"       value={app?.pincode} />
              <InfoRow label="Meter Type"    value={app?.meterType} />
            </InfoGrid>
          </Section>

          {/* Uploaded Documents */}
          <Section title="Uploaded Documents" icon="📎">
            {app?.documents?.length > 0 ? (
              <div className="adp-docs-grid">
                {app.documents.map((doc, i) => {
                  const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc);
                  const label = i === 0 ? 'Aadhaar / ID Proof' : 'Property/Ownership Proof';
                  return (
                    <div key={i} className="adp-doc-card">
                      <div className="adp-doc-icon">{isImg ? '🖼️' : '📄'}</div>
                      <div className="adp-doc-info">
                        <div className="adp-doc-label">Document {i + 1}</div>
                        <div className="adp-doc-name">{label}</div>
                      </div>
                      <a
                        href={`${DOC_BASE}${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adp-doc-view"
                      >
                        View ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="adp-no-data">No documents uploaded.</p>
            )}
          </Section>

          {/* Connection Details */}
          <Section title="Connection Details" icon="🔌">
            <InfoGrid>
              <InfoRow label="Meter Type"        value={app?.meterType} />
              <InfoRow label="Requested Load"    value={`${app?.load} kW`} />
              <InfoRow label="Meter Serial No."  value={app?.meterSerialNumber || '—'} />
              <InfoRow label="Decision Date"     value={fmtDate(app?.decisionDate)} />
              <InfoRow label="Visit Date"        value={fmtDate(app?.visitDate)} />
              <InfoRow label="Installation Date" value={fmtDate(app?.installationDate)} />
              <InfoRow label="Completion Date"   value={fmtDate(app?.completionDate)} />
            </InfoGrid>
          </Section>

          {/* Admin Remarks */}
          <Section title="Admin Remarks" icon="📝">
            {remarksEditing ? (
              <div className="adp-remarks-edit">
                <textarea
                  className="adp-textarea"
                  value={adminRemarks}
                  onChange={e => setAdminRemarks(e.target.value)}
                  rows={4}
                  placeholder="Add admin remarks…"
                />
                <div className="adp-remarks-footer">
                  <button
                    className="adp-btn adp-btn--secondary"
                    onClick={() => setRemarksEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="adp-btn adp-btn--primary"
                    onClick={saveRemarks}
                    disabled={savingRemarks}
                  >
                    {savingRemarks ? 'Saving…' : 'Save Remarks'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="adp-remarks-view">
                <p>{adminRemarks || <span className="adp-no-data">No remarks added yet.</span>}</p>
                <button
                  className="adp-btn adp-btn--ghost"
                  onClick={() => setRemarksEditing(true)}
                >
                  ✏️ {adminRemarks ? 'Edit' : 'Add'} Remarks
                </button>
              </div>
            )}
          </Section>
        </div>

        {/* Right sidebar */}
        <div className="adp-col-side">

          {/* Application Timeline */}
          <Section title="Application Timeline" icon="📅">
            <ol className="adp-timeline">
              {timeline.map((step, i) => (
                <li
                  key={i}
                  className={`adp-tl-item ${step.done ? 'adp-tl-done' : 'adp-tl-pending'}`}
                >
                  <div className="adp-tl-dot">{step.done ? '✓' : '○'}</div>
                  <div className="adp-tl-content">
                    <div className="adp-tl-label">{step.icon} {step.label}</div>
                    {step.date && (
                      <div className="adp-tl-date">{fmtDate(step.date)}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {/* Engineer Assignment */}
          <Section title="Engineer Assignment" icon="👷">
            {engineer ? (
              <div className="adp-engineer-info">
                <div className="adp-eng-avatar">
                  {(typeof engineer === 'object' ? engineer.name : '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="adp-eng-name">
                    {typeof engineer === 'object' ? engineer.name : 'Engineer'}
                  </div>
                  <div className="adp-eng-email">
                    {typeof engineer === 'object' ? engineer.email : ''}
                  </div>
                  {app?.assignmentDate && (
                    <div className="adp-eng-date">
                      Assigned on {fmtDate(app.assignmentDate)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="adp-no-data" style={{ marginBottom: '0.75rem' }}>
                  No engineer assigned yet.
                </p>
                {app?.status === 'Approved' && (
                  <div className="adp-assign-form">
                    <select
                      className="adp-select"
                      value={actionEng}
                      onChange={e => setActionEng(e.target.value)}
                    >
                      <option value="">— Select Engineer —</option>
                      {engineers.map(eng => (
                        <option key={eng._id} value={eng._id}>
                          {eng.name} ({eng.email})
                        </option>
                      ))}
                    </select>
                    <button
                      className="adp-btn adp-btn--primary"
                      disabled={!actionEng || submitting}
                      onClick={async () => {
                        setSubmitting(true);
                        try {
                          await axios.put(
                            `/api/admin/applications/${id}/assign`,
                            { engineerId: actionEng },
                            { headers }
                          );
                          toast.success('Engineer assigned!');
                          setActionEng('');
                          fetchApp();
                        } catch {
                          toast.error('Assignment failed.');
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {submitting ? 'Assigning…' : 'Assign Engineer'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Withdrawal Info */}
          {app?.status === 'Withdrawn' && (
            <Section title="Withdrawal Information" icon="↩️">
              <InfoGrid>
                <InfoRow label="Withdrawn On" value={fmtDate(app.withdrawnAt)} />
                <InfoRow label="Reason" value={app.withdrawalReason || '—'} />
              </InfoGrid>
            </Section>
          )}
        </div>
      </div>

      {/* ══ APPROVE MODAL ══════════════════════════════════════════════════ */}
      {actionModal === 'approve' && (
        <Modal
          title="✅ Approve Application"
          headerClass="adp-mhdr--approve"
          onClose={() => setActionModal(null)}
        >
          <div className="adp-modal-info">
            <strong>{app?.fullName}</strong>
            <span>{app?.applicationId}</span>
          </div>

          <label className="adp-label">Assign Engineer (optional)</label>
          <select className="adp-select" value={actionEng} onChange={e => setActionEng(e.target.value)}>
            <option value="">— No assignment yet —</option>
            {engineers.map(eng => (
              <option key={eng._id} value={eng._id}>{eng.name} ({eng.email})</option>
            ))}
          </select>

          <label className="adp-label">Estimated Visit Date</label>
          <input
            type="date"
            className="adp-input"
            value={actionDate}
            onChange={e => setActionDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />

          <label className="adp-label">Remarks</label>
          <textarea
            className="adp-textarea"
            rows={3}
            value={actionRemark}
            onChange={e => setActionRemark(e.target.value)}
            placeholder="Optional remarks…"
          />

          <div className="adp-modal-footer">
            <button className="adp-btn adp-btn--secondary" onClick={() => setActionModal(null)}>Cancel</button>
            <button className="adp-btn adp-btn--approve" onClick={handleApprove} disabled={submitting}>
              {submitting ? 'Approving…' : '✅ Confirm Approval'}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ REJECT MODAL ═══════════════════════════════════════════════════ */}
      {actionModal === 'reject' && (
        <Modal
          title="❌ Reject Application"
          headerClass="adp-mhdr--reject"
          onClose={() => setActionModal(null)}
        >
          <div className="adp-modal-info">
            <strong>{app?.fullName}</strong>
            <span>{app?.applicationId}</span>
          </div>

          <label className="adp-label">Rejection Reason <span style={{ color: '#EF4444' }}>*</span></label>
          <textarea
            className="adp-textarea"
            rows={4}
            value={actionRemark}
            onChange={e => setActionRemark(e.target.value)}
            placeholder="Describe the reason for rejection…"
          />

          <div className="adp-modal-footer">
            <button className="adp-btn adp-btn--secondary" onClick={() => setActionModal(null)}>Cancel</button>
            <button
              className="adp-btn adp-btn--reject"
              onClick={handleReject}
              disabled={submitting || !actionRemark.trim()}
            >
              {submitting ? 'Rejecting…' : '❌ Confirm Rejection'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Helper Components ─────────────────────────────────────────────────────────
const Section = ({ title, icon, children }) => (
  <div className="adp-section">
    <div className="adp-section-header">
      <span className="adp-section-icon">{icon}</span>
      <h3 className="adp-section-title">{title}</h3>
    </div>
    <div className="adp-section-body">{children}</div>
  </div>
);

const InfoGrid = ({ children }) => (
  <div className="adp-info-grid">{children}</div>
);

const InfoRow = ({ label, value }) => (
  <div className="adp-info-row">
    <span className="adp-info-label">{label}</span>
    <span className="adp-info-value">{value || '—'}</span>
  </div>
);

const Modal = ({ title, headerClass, onClose, children }) => (
  <div className="adp-overlay" onClick={onClose}>
    <div className="adp-modal" onClick={e => e.stopPropagation()}>
      <div className={`adp-modal-header ${headerClass}`}>
        <h3>{title}</h3>
        <button className="adp-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="adp-modal-body">{children}</div>
    </div>
  </div>
);

export default ApplicationDetailPage;
