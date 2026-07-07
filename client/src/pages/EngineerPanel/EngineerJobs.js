import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EngineerPanel.css';

// Helper: Status badge colors
const statusClass = (status) => {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s.includes('assigned'))   return 'status-assigned';
  if (s.includes('scheduled'))  return 'status-scheduled';
  if (s.includes('progress'))   return 'status-inprogress';
  if (s.includes('installed'))  return 'status-installed';
  if (s.includes('completed'))  return 'status-completed';
  return '';
};

// Helper: Priority Calculation
const getPriority = (visitDate) => {
  if (!visitDate) return { label: 'NORMAL', class: 'priority-normal' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const vDate = new Date(visitDate);
  vDate.setHours(0, 0, 0, 0);
  
  const diffTime = vDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'URGENT', class: 'priority-urgent' };
  if (diffDays === 1) return { label: 'HIGH', class: 'priority-high' };
  if (diffDays > 1 && diffDays <= 3) return { label: 'MEDIUM', class: 'priority-medium' };
  return { label: 'NORMAL', class: 'priority-normal' };
};

// Component: Visual Timeline
const JobTimeline = ({ status }) => {
  const steps = ['Assigned', 'Accepted', 'Inspection', 'Installation', 'Completed'];
  
  let currentIndex = 0;
  if (status === 'Engineer Assigned') currentIndex = 0;
  else if (status === 'Visit Scheduled') currentIndex = 1;
  else if (status === 'Installation In Progress') currentIndex = 3;
  else if (status === 'Meter Installed' || status === 'Completed') currentIndex = 4;
  else currentIndex = 0; // Default or unknown

  return (
    <div className="job-timeline">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className={`timeline-step ${idx <= currentIndex ? 'active' : ''}`}>
            <div className="timeline-dot"></div>
            <span className="timeline-label">{step}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`timeline-line ${idx < currentIndex ? 'active' : ''}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function EngineerJobs() {
  const stored = JSON.parse(localStorage.getItem('user')) || {};
  const { token } = stored;

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busy, setBusy]             = useState({});
  const [formState, setFormState]   = useState({});

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/engineer/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error('❌ Jobs fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJobs();
    // eslint-disable-next-line
  }, [token]);

  const updateStatus = async (jobId, status, extra = {}) => {
    setBusy(prev => ({ ...prev, [jobId]: true }));
    try {
      await axios.put(
        `/api/engineer/jobs/${jobId}/status`,
        { status, ...extra },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Status updated to "${status}"`);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to update status. Server error occurred.');
    } finally {
      setBusy(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const openForm = (jobId) =>
    setFormState(prev => ({
      ...prev,
      [jobId]: { open: true, meterSerial: '', installDate: '', remarks: '' }
    }));

  const setField = (jobId, field, value) =>
    setFormState(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], [field]: value }
    }));

  const submitCompletion = async (jobId) => {
    const f = formState[jobId] || {};
    if (!f.meterSerial?.trim()) return toast.warning('Meter Serial Number is required.');
    if (!f.installDate)         return toast.warning('Installation Date is required.');

    await updateStatus(jobId, 'Meter Installed', {
      meterSerialNumber:   f.meterSerial,
      installationDate:    f.installDate,
      installationRemarks: f.remarks
    });

    setFormState(prev => ({ ...prev, [jobId]: { open: false } }));
  };

  return (
    <div className="jobs-container cr-admin-container">
      <div className="cr-top-header">
        <div>
          <h2>📋 My Assigned Work Orders</h2>
          <p>Manage and update your assigned connection jobs.</p>
        </div>
      </div>

      {loading ? (
        <div className="eng-empty">🔄 Loading work orders...</div>
      ) : jobs.length === 0 ? (
        <div className="eng-empty">📭 No work orders assigned to you yet.</div>
      ) : (
        <div className="work-order-list">
          {jobs.map(job => {
            const f       = formState[job._id] || {};
            const isBusy  = !!busy[job._id];
            const status  = job.status || '';
            const priority = getPriority(job.visitDate);

            return (
              <div key={job._id} className="work-order-card">
                {/* ── Card Header ── */}
                <div className="wo-header">
                  <div className="wo-header-left">
                    <span className="wo-id">#{job.applicationId || job._id.substring(0, 8).toUpperCase()}</span>
                    <span className={`job-status ${statusClass(status)}`}>{status}</span>
                  </div>
                  <div className="wo-header-right">
                    <span className={`wo-priority ${priority.class}`}>{priority.label}</span>
                  </div>
                </div>

                {/* ── Timeline ── */}
                <JobTimeline status={status} />

                {/* ── Card Body (Customer & Job Details) ── */}
                <div className="wo-body">
                  <div className="wo-grid">
                    <div className="wo-info-group">
                      <span className="wo-label">Customer Name</span>
                      <strong className="wo-value">{job.fullName}</strong>
                    </div>
                    <div className="wo-info-group">
                      <span className="wo-label">Contact Number</span>
                      <strong className="wo-value">{job.contact}</strong>
                    </div>
                    <div className="wo-info-group">
                      <span className="wo-label">Meter & Load</span>
                      <strong className="wo-value">{job.meterType} — {job.load} kW</strong>
                    </div>
                    <div className="wo-info-group">
                      <span className="wo-label">Target Visit Date</span>
                      <strong className="wo-value">
                        {job.visitDate ? new Date(job.visitDate).toLocaleDateString() : 'Not Scheduled'}
                      </strong>
                    </div>
                  </div>

                  <div className="wo-address">
                    <span className="wo-label">Service Address</span>
                    <p className="wo-value">{job.address}, {job.pincode}</p>
                  </div>

                  {job.assignmentRemarks && (
                    <div className="wo-remarks">
                      <strong>Admin Remarks:</strong> {job.assignmentRemarks}
                    </div>
                  )}
                  
                  {job.installationRemarks && (
                    <div className="wo-remarks" style={{ borderLeftColor: '#10B981' }}>
                      <strong>Install Remarks:</strong> {job.installationRemarks}
                    </div>
                  )}
                </div>

                {/* ── Action Footer ── */}
                <div className="wo-footer">
                  {status === 'Engineer Assigned' && (
                    <button
                      className="wo-btn wo-btn-accept"
                      disabled={isBusy}
                      onClick={() => updateStatus(job._id, 'Visit Scheduled')}
                    >
                      {isBusy ? 'Processing...' : 'Accept Work Order'}
                    </button>
                  )}

                  {status === 'Visit Scheduled' && (
                    <div className="wo-schedule-action">
                      <input
                        type="date"
                        className="wo-input"
                        title="Pick visit date"
                        onChange={e => setField(job._id, 'visitDate', e.target.value)}
                        value={f.visitDate || ''}
                      />
                      <button
                        className="wo-btn wo-btn-start"
                        disabled={isBusy || !f.visitDate}
                        onClick={() =>
                          updateStatus(job._id, 'Installation In Progress', {
                            visitDate: f.visitDate
                          })
                        }
                      >
                        Confirm Visit & Start
                      </button>
                    </div>
                  )}

                  {status === 'Installation In Progress' && !f.open && (
                    <button
                      className="wo-btn wo-btn-complete"
                      disabled={isBusy}
                      onClick={() => openForm(job._id)}
                    >
                      Complete Installation
                    </button>
                  )}

                  {/* ── Inline Completion Form ── */}
                  {f.open && (
                    <div className="wo-completion-form">
                      <h4>📝 Finalize Installation</h4>
                      <div className="wo-form-grid">
                        <input
                          type="text"
                          className="wo-input"
                          placeholder="Meter Serial Number *"
                          value={f.meterSerial || ''}
                          onChange={e => setField(job._id, 'meterSerial', e.target.value)}
                        />
                        <input
                          type="date"
                          className="wo-input"
                          title="Installation Date"
                          value={f.installDate || ''}
                          onChange={e => setField(job._id, 'installDate', e.target.value)}
                        />
                      </div>
                      <textarea
                        className="wo-input"
                        placeholder="Installation remarks (optional)..."
                        rows="3"
                        value={f.remarks || ''}
                        onChange={e => setField(job._id, 'remarks', e.target.value)}
                        style={{ marginTop: '0.75rem', width: '100%', resize: 'vertical' }}
                      />
                      <div className="wo-form-actions">
                        <button
                          className="wo-btn wo-btn-complete"
                          disabled={isBusy}
                          onClick={() => submitCompletion(job._id)}
                        >
                          {isBusy ? 'Saving...' : 'Submit & Mark Completed'}
                        </button>
                        <button
                          className="wo-btn wo-btn-secondary"
                          onClick={() => setFormState(prev => ({ ...prev, [job._id]: { open: false } }))}
                        >
                          Cancel
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
}
