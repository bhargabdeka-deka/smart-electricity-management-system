// src/pages/EngineerPanel/EngineerJobs.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EngineerPanel.css';

// Map status string → CSS class
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

export default function EngineerJobs() {
  const stored = JSON.parse(localStorage.getItem('user')) || {};
  const { token } = stored;

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busy, setBusy]             = useState({});      // per-job loading
  // completion form state per job: { [jobId]: { open, meterSerial, installDate, remarks } }
  const [formState, setFormState]   = useState({});

  // ─── Fetch jobs ────────────────────────────────────────────────────────────
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

  // ─── Generic status update ─────────────────────────────────────────────────
  const updateStatus = async (jobId, status, extra = {}) => {
    setBusy(prev => ({ ...prev, [jobId]: true }));
    try {
      await axios.put(
        `/api/engineer/jobs/${jobId}/status`,
        { status, ...extra },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Status updated to "${status}"`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || '⚠️ Failed to update status.');
    } finally {
      setBusy(prev => ({ ...prev, [jobId]: false }));
    }
  };

  // ─── Completion form helpers ───────────────────────────────────────────────
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
    if (!f.meterSerial?.trim()) return alert('⚠️ Meter Serial Number is required.');
    if (!f.installDate)         return alert('⚠️ Installation Date is required.');

    await updateStatus(jobId, 'Meter Installed', {
      meterSerialNumber:   f.meterSerial,
      installationDate:    f.installDate,
      installationRemarks: f.remarks
    });

    // close the form after submission
    setFormState(prev => ({ ...prev, [jobId]: { open: false } }));
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="jobs-container">
      <h2>📋 My Assigned Jobs</h2>

      {loading ? (
        <p>🔄 Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>📭 No jobs assigned to you yet.</p>
      ) : (
        jobs.map(job => {
          const f       = formState[job._id] || {};
          const isBusy  = !!busy[job._id];
          const status  = job.status || '';

          return (
            <div key={job._id} className="job-card">
              {/* ── Job Info ── */}
              <p>
                <strong>Application ID:</strong>{' '}
                <code style={{ fontSize: '0.82rem' }}>{job._id}</code>
              </p>
              <p><strong>Customer Name:</strong>   {job.fullName}</p>
              <p><strong>Address:</strong>          {job.address}, {job.pincode}</p>
              <p><strong>Phone:</strong>            {job.contact}</p>
              <p><strong>Meter Type:</strong>       {job.meterType}</p>
              <p><strong>Connection Load:</strong>  {job.load} kW</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`job-status ${statusClass(status)}`}>{status}</span>
              </p>
              <p>
                <strong>Assigned On:</strong>{' '}
                {job.assignmentDate ? job.assignmentDate.slice(0, 10) : '—'}
              </p>
              {job.visitDate && (
                <p><strong>Scheduled Visit:</strong> {job.visitDate.slice(0, 10)}</p>
              )}
              {job.meterSerialNumber && (
                <p><strong>Meter Serial:</strong> {job.meterSerialNumber}</p>
              )}
              {job.installationDate && (
                <p><strong>Installed On:</strong> {job.installationDate.slice(0, 10)}</p>
              )}
              {job.installationRemarks && (
                <p><strong>Remarks:</strong> {job.installationRemarks}</p>
              )}

              {/* ── Action Buttons ── */}
              <div className="job-actions">
                {/* Accept Job — from "Engineer Assigned" */}
                {status === 'Engineer Assigned' && (
                  <button
                    className="btn-action btn-accept"
                    disabled={isBusy}
                    onClick={() => updateStatus(job._id, 'Visit Scheduled')}
                  >
                    ✅ Accept Job
                  </button>
                )}

                {/* Schedule Visit — from "Visit Scheduled", let engineer set a date */}
                {status === 'Visit Scheduled' && (
                  <>
                    <input
                      type="date"
                      title="Pick visit date"
                      style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
                      onChange={e => setField(job._id, 'visitDate', e.target.value)}
                      value={f.visitDate || ''}
                    />
                    <button
                      className="btn-action btn-schedule"
                      disabled={isBusy || !f.visitDate}
                      onClick={() =>
                        updateStatus(job._id, 'Installation In Progress', {
                          visitDate: f.visitDate
                        })
                      }
                    >
                      🗓 Confirm Visit & Start
                    </button>
                  </>
                )}

                {/* Complete Installation — from "Installation In Progress" */}
                {status === 'Installation In Progress' && !f.open && (
                  <button
                    className="btn-action btn-complete"
                    disabled={isBusy}
                    onClick={() => openForm(job._id)}
                  >
                    🔧 Complete Installation
                  </button>
                )}
              </div>

              {/* ── Completion Form (inline) ── */}
              {f.open && (
                <div className="completion-form">
                  <h4>📝 Installation Details</h4>
                  <input
                    type="text"
                    placeholder="Meter Serial Number *"
                    value={f.meterSerial || ''}
                    onChange={e => setField(job._id, 'meterSerial', e.target.value)}
                  />
                  <input
                    type="date"
                    title="Installation Date"
                    value={f.installDate || ''}
                    onChange={e => setField(job._id, 'installDate', e.target.value)}
                  />
                  <textarea
                    placeholder="Installation remarks (optional)"
                    value={f.remarks || ''}
                    onChange={e => setField(job._id, 'remarks', e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-action btn-complete"
                      disabled={isBusy}
                      onClick={() => submitCompletion(job._id)}
                    >
                      {isBusy ? '⏳ Saving…' : '✅ Submit & Mark Installed'}
                    </button>
                    <button
                      className="btn-action"
                      style={{ background: '#6c757d', color: '#fff' }}
                      onClick={() =>
                        setFormState(prev => ({ ...prev, [job._id]: { open: false } }))
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
