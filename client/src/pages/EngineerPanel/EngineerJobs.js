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
  if (s.includes('inspection')) return 'status-inprogress';
  if (s.includes('progress'))   return 'status-inprogress';
  if (s.includes('installed'))  return 'status-installed';
  if (s.includes('activated'))  return 'status-installed';
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
  const steps = ['Assigned', 'Visit Scheduled', 'Inspection Completed', 'Installation', 'Completed'];
  
  let currentIndex = 0;
  if (status === 'Engineer Assigned') currentIndex = 0;
  else if (status === 'Visit Scheduled') currentIndex = 1;
  else if (status === 'Inspection Completed') currentIndex = 2;
  else if (status === 'Installation In Progress') currentIndex = 3;
  else if (status === 'Meter Installed' || status === 'Connection Activated' || status === 'Completed') currentIndex = 4;
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

  const setField = (jobId, field, value) =>
    setFormState(prev => ({
      ...prev,
      [jobId]: { ...prev[jobId], [field]: value }
    }));

  const submitInspection = async (jobId) => {
    const f = formState[jobId] || {};
    if (!f.result) return toast.warning('Inspection Result is required.');

    await updateStatus(jobId, 'Inspection Completed', {
      inspection: {
        result: f.result,
        customerPresent: !!f.customerPresent,
        poleAvailable: !!f.poleAvailable,
        wiringCondition: f.wiringCondition || '',
        loadVerified: !!f.loadVerified,
        distanceFromPole: f.distanceFromPole ? Number(f.distanceFromPole) : 0,
        remarks: f.remarks || ''
      }
    });

    setField(jobId, 'openInspection', false);
  };

  const submitInstallation = async (jobId) => {
    const f = formState[jobId] || {};
    if (!f.meterSerialNumber || !f.meterManufacturer || !f.sealNumber || !f.installationResult) {
      return toast.warning('Please fill in all required installation fields.');
    }

    await updateStatus(jobId, 'Meter Installed', {
      installation: {
        meterSerialNumber: f.meterSerialNumber,
        meterManufacturer: f.meterManufacturer,
        meterType: f.meterType || '1-Phase',
        sealNumber: f.sealNumber,
        initialReading: f.initialReading ? Number(f.initialReading) : 0,
        installationResult: f.installationResult,
        installationRemarks: f.installationRemarks || ''
      }
    });

    setField(jobId, 'openInstallation', false);
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

                  {/* Render saved inspection details if available */}
                  {job.inspection && job.inspection.result && (
                    <div className="wo-remarks" style={{ borderLeftColor: job.inspection.result === 'Approved' ? '#10B981' : '#F59E0B', background: '#F8FAFC' }}>
                      <strong style={{ display: 'block', marginBottom: '0.4rem' }}>🔍 Inspection Report ({job.inspection.result})</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><strong>Customer Present:</strong> {job.inspection.customerPresent ? 'Yes' : 'No'}</div>
                        <div><strong>Pole Available:</strong> {job.inspection.poleAvailable ? 'Yes' : 'No'}</div>
                        <div><strong>Wiring Condition:</strong> {job.inspection.wiringCondition || '—'}</div>
                        <div><strong>Distance:</strong> {job.inspection.distanceFromPole}m</div>
                      </div>
                      {job.inspection.remarks && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}><strong>Remarks:</strong> {job.inspection.remarks}</div>
                      )}
                    </div>
                  )}

                  {/* Render saved installation details if available */}
                  {job.installation && job.installation.meterSerialNumber && (
                    <div className="wo-remarks" style={{ borderLeftColor: job.installation.installationResult === 'Successful' ? '#3B82F6' : '#EF4444', background: '#EFF6FF', marginTop: '0.5rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.4rem' }}>⚡ Installation Report ({job.installation.installationResult})</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><strong>Meter S/N:</strong> {job.installation.meterSerialNumber}</div>
                        <div><strong>Manufacturer:</strong> {job.installation.meterManufacturer}</div>
                        <div><strong>Seal No:</strong> {job.installation.sealNumber}</div>
                        <div><strong>Reading:</strong> {job.installation.initialReading}</div>
                      </div>
                      {job.installation.installationRemarks && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}><strong>Remarks:</strong> {job.installation.installationRemarks}</div>
                      )}
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

                  {status === 'Visit Scheduled' && !f.openInspection && (
                    <button
                      className="wo-btn wo-btn-start"
                      disabled={isBusy}
                      onClick={() => setField(job._id, 'openInspection', true)}
                    >
                      Initiate Site Inspection
                    </button>
                  )}

                  {/* ── Inline Site Inspection Form ── */}
                  {f.openInspection && (
                    <div className="wo-completion-form">
                      <h4>🔍 Site Inspection Report</h4>
                      <div className="wo-form-grid">
                        <select
                          className="wo-input"
                          value={f.result || ''}
                          onChange={e => setField(job._id, 'result', e.target.value)}
                        >
                          <option value="">Select Inspection Result *</option>
                          <option value="Approved">Approved</option>
                          <option value="Revisit Required">Revisit Required</option>
                          <option value="Customer Absent">Customer Absent</option>
                          <option value="Site Not Feasible">Site Not Feasible</option>
                        </select>
                        <input
                          type="number"
                          className="wo-input"
                          placeholder="Distance from Pole (meters)"
                          value={f.distanceFromPole || ''}
                          onChange={e => setField(job._id, 'distanceFromPole', e.target.value)}
                        />
                        <select
                          className="wo-input"
                          value={f.wiringCondition || ''}
                          onChange={e => setField(job._id, 'wiringCondition', e.target.value)}
                        >
                          <option value="">Wiring Condition</option>
                          <option value="Good">Good</option>
                          <option value="Needs Repair">Needs Repair</option>
                          <option value="Unsafe">Unsafe</option>
                        </select>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <input type="checkbox" checked={f.customerPresent || false} onChange={e => setField(job._id, 'customerPresent', e.target.checked)} /> 
                            Customer Present
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <input type="checkbox" checked={f.poleAvailable || false} onChange={e => setField(job._id, 'poleAvailable', e.target.checked)} /> 
                            Pole Available
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <input type="checkbox" checked={f.loadVerified || false} onChange={e => setField(job._id, 'loadVerified', e.target.checked)} /> 
                            Load Verified
                          </label>
                        </div>
                      </div>
                      <textarea
                        className="wo-input"
                        placeholder="Inspection Remarks..."
                        rows="2"
                        value={f.remarks || ''}
                        onChange={e => setField(job._id, 'remarks', e.target.value)}
                        style={{ marginTop: '0.75rem', width: '100%', resize: 'vertical' }}
                      />
                      <div className="wo-form-actions">
                        <button
                          className="wo-btn wo-btn-complete"
                          disabled={isBusy || !f.result}
                          onClick={() => submitInspection(job._id)}
                        >
                          {isBusy ? 'Submitting...' : 'Submit Inspection'}
                        </button>
                        <button
                          className="wo-btn wo-btn-secondary"
                          onClick={() => setField(job._id, 'openInspection', false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'Inspection Completed' && (
                    <button
                      className="wo-btn wo-btn-start"
                      disabled={isBusy}
                      onClick={() => updateStatus(job._id, 'Installation In Progress')}
                    >
                      Begin Installation
                    </button>
                  )}

                  {status === 'Installation In Progress' && !f.openInstallation && (
                    <button
                      className="wo-btn wo-btn-start"
                      disabled={isBusy}
                      onClick={() => setField(job._id, 'openInstallation', true)}
                    >
                      Fill Installation Report
                    </button>
                  )}

                  {/* ── Inline Installation Form ── */}
                  {f.openInstallation && (
                    <div className="wo-completion-form">
                      <h4>⚡ Meter Installation Report</h4>
                      <div className="wo-form-grid">
                        <input
                          type="text"
                          className="wo-input"
                          placeholder="Meter Serial Number *"
                          value={f.meterSerialNumber || ''}
                          onChange={e => setField(job._id, 'meterSerialNumber', e.target.value)}
                        />
                        <select
                          className="wo-input"
                          value={f.meterManufacturer || ''}
                          onChange={e => setField(job._id, 'meterManufacturer', e.target.value)}
                        >
                          <option value="">Manufacturer *</option>
                          <option value="Secure">Secure</option>
                          <option value="Genus">Genus</option>
                          <option value="L&T">L&T</option>
                          <option value="HPL">HPL</option>
                        </select>
                        <input
                          type="text"
                          className="wo-input"
                          placeholder="Seal Number *"
                          value={f.sealNumber || ''}
                          onChange={e => setField(job._id, 'sealNumber', e.target.value)}
                        />
                        <input
                          type="number"
                          className="wo-input"
                          placeholder="Initial Reading (kWh)"
                          value={f.initialReading || ''}
                          onChange={e => setField(job._id, 'initialReading', e.target.value)}
                        />
                        <select
                          className="wo-input"
                          value={f.meterType || ''}
                          onChange={e => setField(job._id, 'meterType', e.target.value)}
                        >
                          <option value="">Meter Type</option>
                          <option value="1-Phase">1-Phase</option>
                          <option value="3-Phase">3-Phase</option>
                        </select>
                        <select
                          className="wo-input"
                          value={f.installationResult || ''}
                          onChange={e => setField(job._id, 'installationResult', e.target.value)}
                        >
                          <option value="">Result *</option>
                          <option value="Successful">Successful</option>
                          <option value="Failed - Customer Refused">Failed - Customer Refused</option>
                          <option value="Failed - Technical Issue">Failed - Technical Issue</option>
                        </select>
                      </div>
                      <textarea
                        className="wo-input"
                        placeholder="Installation Remarks..."
                        rows="2"
                        value={f.installationRemarks || ''}
                        onChange={e => setField(job._id, 'installationRemarks', e.target.value)}
                        style={{ marginTop: '0.75rem', width: '100%', resize: 'vertical' }}
                      />
                      <div className="wo-form-actions">
                        <button
                          className="wo-btn wo-btn-complete"
                          disabled={isBusy || !f.meterSerialNumber || !f.meterManufacturer || !f.sealNumber || !f.installationResult}
                          onClick={() => submitInstallation(job._id)}
                        >
                          {isBusy ? 'Submitting...' : 'Submit Installation'}
                        </button>
                        <button
                          className="wo-btn wo-btn-secondary"
                          onClick={() => setField(job._id, 'openInstallation', false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'Meter Installed' && (
                     <div style={{ padding: '0.75rem', backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#047857', borderRadius: '6px', textAlign: 'center', fontWeight: '500' }}>
                        ✅ Hardware Installed - Waiting for Admin Activation
                     </div>
                  )}

                  {status === 'Connection Activated' && (
                     <div style={{ padding: '0.75rem', backgroundColor: '#EFF6FF', border: '1px solid #3B82F6', color: '#1D4ED8', borderRadius: '6px', textAlign: 'center', fontWeight: '500' }}>
                        ⚡ Grid Energized - Connection Activated
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
