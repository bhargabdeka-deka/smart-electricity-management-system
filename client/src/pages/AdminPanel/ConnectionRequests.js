import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ConnectionRequests.css';

const ROWS_PER_PAGE = 10;

const ConnectionRequests = () => {
  const navigate = useNavigate();
  const user    = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${user?.token}` };

  // ── State ──────────────────────────────────────────────────────────────────
  const [requests,   setRequests]   = useState([]);
  const [engineers,  setEngineers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Filters
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterType,     setFilterType]     = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterDate,     setFilterDate]     = useState('');

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Pagination
  const [page, setPage] = useState(1);

  // Approve modal
  const [approveModal, setApproveModal] = useState(null); // { request }
  const [approving, setApproving] = useState(false);

  // Reject modal
  const [rejectModal,  setRejectModal]  = useState(null); // { request }
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Assign modal (Step 5)
  const [assignModal, setAssignModal] = useState(null); // { request }
  const [assignEngineerId, setAssignEngineerId] = useState('');
  const [assignVisitDate, setAssignVisitDate] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');

  // Drawer & Document Preview
  const [selectedDrawerApp, setSelectedDrawerApp] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { url, type, name }

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user?.token || user?.role !== 'admin') {
      setError('⛔ Admin access required.');
      setLoading(false);
      return;
    }
    try {
      const [appsRes, engRes] = await Promise.all([
        axios.get('/api/admin/applications', { headers }),
        axios.get('/api/admin/engineers',    { headers }),
      ]);
      setRequests(appsRes.data);
      setEngineers(engRes.data);
    } catch (err) {
      setError(err.response?.data?.message || '❗ Failed to load data.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filtering + Sorting ────────────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      r.applicationId?.toLowerCase().includes(q) ||
      r.fullName?.toLowerCase().includes(q) ||
      r.meterNumber?.toLowerCase().includes(q) ||
      r.contact?.toLowerCase().includes(q);
      
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchType   = !filterType   || r.userType === filterType;
    
    // Fallback: district search inside address or pincode
    const matchDistrict = !filterDistrict || 
      r.address?.toLowerCase().includes(filterDistrict.toLowerCase()) || 
      r.pincode?.includes(filterDistrict);
      
    const matchDate = !filterDate || (r.createdAt && r.createdAt.substring(0, 10) === filterDate);

    return matchSearch && matchStatus && matchType && matchDistrict && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle nested or derived values
    if (sortConfig.key === 'district') {
      aValue = a.pincode || a.address || '';
      bValue = b.pincode || b.address || '';
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const paginated  = sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Reset page on filter change
  useEffect(() => setPage(1), [search, filterStatus, filterType, filterDistrict, filterDate]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ── Status helpers ─────────────────────────────────────────────────────────
  const badgeClass = (status) => {
    const map = {
      'Pending':           'cr-badge--pending',
      'Under Review':      'cr-badge--review',
      'Approved':          'cr-badge--approved',
      'Rejected':          'cr-badge--rejected',
      'Withdrawn':         'cr-badge--withdrawn',
      'Engineer Assigned': 'cr-badge--assigned',
      'Visit Scheduled':   'cr-badge--assigned',
      'Meter Installed':   'cr-badge--completed',
      'Completed':         'cr-badge--completed',
    };
    return map[status] || 'cr-badge--pending';
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── Approve Handler ────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!approveModal) return;
    setApproving(true);
    try {
      await axios.put(
        `/api/admin/applications/${approveModal._id}/status`,
        { status: 'Approved' },
        { headers }
      );
      toast.success('Application approved successfully!');
      if (selectedDrawerApp && selectedDrawerApp._id === approveModal._id) {
        setSelectedDrawerApp({ ...selectedDrawerApp, status: 'Approved' });
      }
      setApproveModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve application.');
    } finally {
      setApproving(false);
    }
  };

  // ── Reject Handler ─────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      return toast.warning('Please select a rejection reason.');
    }
    setRejecting(true);
    try {
      await axios.put(
        `/api/admin/applications/${rejectModal._id}/status`,
        { status: 'Rejected' },
        { headers }
      );
      const finalRemarks = rejectReason === 'Other' ? rejectRemarks : rejectReason;
      if (finalRemarks.trim()) {
        await axios.put(
          `/api/admin/applications/${rejectModal._id}/remarks`,
          { remarks: finalRemarks },
          { headers }
        );
      }
      toast.success('Application rejected.');
      if (selectedDrawerApp && selectedDrawerApp._id === rejectModal._id) {
        setSelectedDrawerApp({ ...selectedDrawerApp, status: 'Rejected', installationRemarks: finalRemarks });
      }
      setRejectModal(null);
      setRejectReason('');
      setRejectRemarks('');
      fetchAll();
    } catch (err) {
      toast.error('Failed to reject application.');
    } finally {
      setRejecting(false);
    }
  };

  // ── Assign Handler (Step 5) ────────────────────────────────────────────────
  const handleAssignSubmit = async () => {
    if (!assignModal || !assignEngineerId || !assignVisitDate) return;
    setAssigning(true);
    try {
      const payload = {
        engineerId: assignEngineerId,
        visitDate: assignVisitDate
      };
      if (assignRemarks.trim()) payload.remarks = assignRemarks;

      await axios.put(`/api/admin/applications/${assignModal._id}/assign`, 
        payload,
        { headers }
      );
      toast.success('Engineer assigned successfully!');
      
      if (selectedDrawerApp && selectedDrawerApp._id === assignModal._id) {
        setSelectedDrawerApp({ 
          ...selectedDrawerApp, 
          status: 'Engineer Assigned',
          assignedEngineer: engineers.find(e => e._id === assignEngineerId),
          visitDate: assignVisitDate,
          installationRemarks: assignRemarks
        });
      }
      
      setAssignModal(null);
      setAssignEngineerId('');
      setAssignVisitDate('');
      setAssignRemarks('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign engineer');
    } finally {
      setAssigning(false);
    }
  };



  // ── Distinct values for filters ────────────────────────────────────────────
  const allStatuses = [...new Set(requests.map(r => r.status).filter(Boolean))];
  const allTypes    = [...new Set(requests.map(r => r.userType).filter(Boolean))];

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!user?.token || user?.role !== 'admin') {
    return <p className="cr-access-denied">⛔ Admin access required.</p>;
  }

  return (
    <div className="cr-root">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="cr-page-header">
        <div>
          <h1 className="cr-page-title">Connection Requests</h1>
          <p className="cr-page-sub">
            {filtered.length} application{filtered.length !== 1 ? 's' : ''}
            {search || filterStatus || filterType ? ' (filtered)' : ' total'}
          </p>
        </div>
      </div>

      {/* ── Filters Row ──────────────────────────────────────────────────── */}
      <div className="cr-filters cr-filters--advanced">
        <div className="cr-search-wrap">
          <span className="cr-search-icon">🔍</span>
          <input
            className="cr-search"
            placeholder="Search by name, App ID, meter, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="cr-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <select
          className="cr-filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="cr-filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">All Connection Types</option>
          {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <input
          type="text"
          className="cr-filter-input"
          placeholder="Filter by District / Pincode"
          value={filterDistrict}
          onChange={e => setFilterDistrict(e.target.value)}
        />

        <input
          type="date"
          className="cr-filter-date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />

        {(search || filterStatus || filterType || filterDistrict || filterDate) && (
          <button
            className="cr-clear-all"
            onClick={() => { 
              setSearch(''); 
              setFilterStatus(''); 
              setFilterType('');
              setFilterDistrict('');
              setFilterDate('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="cr-card">
        {loading ? (
          <div className="cr-loading">
            <div className="cr-spinner" />
            <span>Loading applications…</span>
          </div>
        ) : error ? (
          <div className="cr-error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="cr-empty">
            <span>📭</span>
            <p>No applications match your filters.</p>
          </div>
        ) : (
          <div className="cr-table-wrap">
            <table className="cr-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('_id')} className="cr-th-sortable"># {sortConfig.key === '_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('applicationId')} className="cr-th-sortable">App ID {sortConfig.key === 'applicationId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('fullName')} className="cr-th-sortable">Consumer Name {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('meterNumber')} className="cr-th-sortable">Consumer Number {sortConfig.key === 'meterNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('district')} className="cr-th-sortable">District / Pincode {sortConfig.key === 'district' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('userType')} className="cr-th-sortable">Connection Type {sortConfig.key === 'userType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('load')} className="cr-th-sortable">Load (kW) {sortConfig.key === 'load' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('status')} className="cr-th-sortable">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('createdAt')} className="cr-th-sortable">Submission Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th>Assigned Engineer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, idx) => {
                  const rowNum = (page - 1) * ROWS_PER_PAGE + idx + 1;
                  return (
                    <tr key={r._id} className="cr-row">
                      <td className="cr-td-num">{rowNum}</td>
                      <td className="cr-td-id">{r.applicationId || r._id.slice(-8)}</td>
                      <td className="cr-td-name">
                        <div className="cr-name">{r.fullName}</div>
                        <div className="cr-name-sub">{r.email}</div>
                      </td>
                      <td>{r.meterNumber || '—'}</td>
                      <td>
                        <div className="cr-district-col" title={r.address}>{r.pincode || '—'}</div>
                      </td>
                      <td>{r.userType}</td>
                      <td>{r.load}</td>
                      <td>
                        <span className={`cr-badge ${badgeClass(r.status)}`}>{r.status}</span>
                      </td>
                      <td>{fmtDate(r.createdAt)}</td>
                      <td>
                        {r.status === 'Approved' ? (
                          <button
                            className="cr-btn cr-btn--assign-modal"
                            onClick={() => {
                              setAssignEngineerId('');
                              setAssignVisitDate('');
                              setAssignRemarks('');
                              setAssignModal(r);
                            }}
                          >
                            Assign Engineer
                          </button>
                        ) : r.assignedEngineer ? (
                          <span className="cr-engineer-name">
                            👷 {typeof r.assignedEngineer === 'object'
                              ? r.assignedEngineer.name
                              : engineers.find(e => e._id === r.assignedEngineer)?.name || '—'}
                          </span>
                        ) : (
                          <span className="cr-no-engineer">—</span>
                        )}
                      </td>
                      <td>
                        <div className="cr-actions">
                          <button
                            className="cr-btn cr-btn--quickview"
                            onClick={() => setSelectedDrawerApp(r)}
                            title="Quick View in Drawer"
                          >
                            Quick View
                          </button>
                          <button
                            className="cr-btn cr-btn--view"
                            onClick={() => navigate(`/admin/connections/${r._id}`)}
                            title="View Full Details"
                          >
                            Full View
                          </button>
                          {r.status === 'Pending' && (
                            <>
                              <button
                                className="cr-btn cr-btn--approve"
                                onClick={() => setApproveModal(r)}
                                title="Approve"
                              >
                                Approve
                              </button>
                              <button
                                className="cr-btn cr-btn--reject"
                                onClick={() => setRejectModal(r)}
                                title="Reject"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {!loading && sorted.length > ROWS_PER_PAGE && (
          <div className="cr-pagination">
            <span className="cr-page-info">
              Showing {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, sorted.length)} of {sorted.length}
            </span>
            <div className="cr-page-btns">
              <button
                className="cr-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ‹ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={`ellipsis-${i}`} className="cr-page-ellipsis">…</span>
                    : (
                      <button
                        key={p}
                        className={`cr-page-btn ${page === p ? 'cr-page-btn--active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    )
                )}
              <button
                className="cr-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ APPROVE MODAL ══════════════════════════════════════════════════ */}
      {approveModal && (
        <div className="cr-modal-overlay">
          <div className="cr-modal">
            <div className="cr-modal-header cr-modal-header--approve">
              <h3>Confirm Approval</h3>
              <button className="cr-modal-close" onClick={() => setApproveModal(null)}>✕</button>
            </div>
            <div className="cr-modal-body">
              <p>Are you sure you want to approve application <strong>{approveModal.applicationId}</strong> for <strong>{approveModal.fullName}</strong>?</p>
              <p className="cr-modal-note" style={{ marginTop: '0.5rem', color: '#5A6474', fontSize: '0.85rem' }}>This will change the status to Approved. You can assign an engineer afterward.</p>
            </div>
            <div className="cr-modal-footer">
              <button className="cr-btn cr-btn--secondary" onClick={() => setApproveModal(null)}>Cancel</button>
              <button 
                className="cr-btn cr-btn--approve" 
                onClick={handleApprove}
                disabled={approving}
              >
                {approving ? 'Approving...' : 'Approve Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ REJECT MODAL ═══════════════════════════════════════════════════ */}
      {rejectModal && (
        <div className="cr-modal-overlay">
          <div className="cr-modal">
            <div className="cr-modal-header cr-modal-header--reject">
              <h3>Confirm Rejection</h3>
              <button className="cr-modal-close" onClick={() => { setRejectModal(null); setRejectReason(''); setRejectRemarks(''); }}>✕</button>
            </div>
            <div className="cr-modal-body">
              <label className="cr-label">Rejection Reason <span className="cr-required">*</span></label>
              <select 
                className="cr-modal-select" 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)}
              >
                <option value="">-- Select Reason --</option>
                <option value="Incomplete Documents">Incomplete Documents</option>
                <option value="Invalid Address">Invalid Address</option>
                <option value="Duplicate Application">Duplicate Application</option>
                <option value="Customer Request">Customer Request</option>
                <option value="Other">Other</option>
              </select>

              {rejectReason === 'Other' && (
                <>
                  <label className="cr-label" style={{ marginTop: '0.5rem' }}>Remarks</label>
                  <textarea 
                    className="cr-modal-textarea" 
                    placeholder="Provide specific reason..."
                    rows="3"
                    value={rejectRemarks}
                    onChange={e => setRejectRemarks(e.target.value)}
                  ></textarea>
                </>
              )}
            </div>
            <div className="cr-modal-footer">
              <button className="cr-btn cr-btn--secondary" onClick={() => { setRejectModal(null); setRejectReason(''); setRejectRemarks(''); }}>Cancel</button>
              <button 
                className="cr-btn cr-btn--reject" 
                onClick={handleReject}
                disabled={rejecting || !rejectReason}
              >
                {rejecting ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ASSIGN ENGINEER MODAL ════════════════════════════════════════ */}
      {assignModal && (() => {
        const targetDate = assignVisitDate || new Date().toISOString().split("T")[0];
        
        const processedEngineers = [...engineers]
          .map(eng => {
            const todayJobs = eng.visitDates ? eng.visitDates.filter(d => d === targetDate).length : 0;
            const pendingJobs = eng.workload || 0;
            let availability = 'Available';
            let badgeClass = 'available';
            if (todayJobs === 3) {
              availability = 'Busy';
              badgeClass = 'busy';
            } else if (todayJobs >= 4) {
              availability = 'Fully Booked';
              badgeClass = 'overloaded';
            }
            const isRecommended = (assignModal?.address || '').toLowerCase().includes((eng.district || '').toLowerCase()) && eng.district;
            return { ...eng, todayJobs, pendingJobs, availability, badgeClass, isRecommended };
          })
          .filter(eng => {
            const q = assignSearch.toLowerCase();
            return (
              (eng.name || '').toLowerCase().includes(q) ||
              (eng.district || '').toLowerCase().includes(q) ||
              (eng.phoneNumber || '').toLowerCase().includes(q)
            );
          })
          .sort((a, b) => {
            if (a.isRecommended && !b.isRecommended) return -1;
            if (!a.isRecommended && b.isRecommended) return 1;
            if (a.pendingJobs !== b.pendingJobs) return a.pendingJobs - b.pendingJobs;
            return (a.name || '').localeCompare(b.name || '');
          });

        return (
        <div className="cr-modal-overlay">
          <div className="cr-modal cr-modal--large">
            <div className="cr-modal-header">
              <h3>Assign Engineer</h3>
              <button className="cr-modal-close" onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="cr-modal-body">
              <div className="cr-assign-layout">
                {/* Form fields (Left Column) */}
                <div className="cr-assign-fields">
                  <label className="cr-label">Target Visit Date <span className="cr-required">*</span></label>
                  <input 
                    type="date" 
                    className="cr-modal-input" 
                    value={assignVisitDate}
                    onChange={e => {
                      setAssignVisitDate(e.target.value);
                      setAssignEngineerId('');
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />

                  <label className="cr-label" style={{ marginTop: '1rem' }}>Assignment Remarks (Optional)</label>
                  <textarea 
                    className="cr-modal-textarea" 
                    placeholder="Instructions for the engineer..."
                    rows="4"
                    value={assignRemarks}
                    onChange={e => setAssignRemarks(e.target.value)}
                  ></textarea>
                </div>

                {/* Engineer Selection List (Right Column) */}
                <div className="cr-engineer-list-wrap">
                  <input 
                    type="text" 
                    className="cr-modal-input" 
                    placeholder="Search Name, District, or Phone..." 
                    value={assignSearch}
                    onChange={e => setAssignSearch(e.target.value)}
                    style={{ marginBottom: '1rem' }}
                  />
                  <div className="cr-engineer-list">
                    {processedEngineers.map(eng => (
                        <div 
                          key={eng._id} 
                          className={`cr-engineer-card ${assignEngineerId === eng._id ? 'selected' : ''} ${eng.availability === 'Fully Booked' ? 'disabled' : ''}`}
                          onClick={() => {
                            if (eng.availability !== 'Fully Booked') {
                              setAssignEngineerId(eng._id);
                            } else {
                              toast.warning(`${eng.name} is fully booked on this date.`);
                            }
                          }}
                        >
                          <div className="cr-engineer-card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong>{eng.name}</strong>
                              {eng.isRecommended && <span className="cr-badge cr-badge--recommended">★ Recommended</span>}
                            </div>
                            <span className={`cr-badge cr-badge--${eng.badgeClass}`}>{eng.availability}</span>
                          </div>
                          <div className="cr-engineer-card-details">
                            <span>📍 {eng.district || 'Unassigned'}</span>
                            <span>📞 {eng.phoneNumber || 'N/A'}</span>
                            <span>📅 Jobs on {targetDate}: <strong>{eng.todayJobs}</strong></span>
                            <span>💼 Total Pending Jobs: <strong>{eng.pendingJobs}</strong></span>
                          </div>
                        </div>
                    ))}
                    {processedEngineers.length === 0 && (
                      <p style={{ textAlign: 'center', color: '#64748B', padding: '1rem' }}>No engineers match your search.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="cr-modal-footer">
              <button className="cr-btn cr-btn--secondary" onClick={() => setAssignModal(null)}>Cancel</button>
              <button 
                className="cr-btn cr-btn--approve" 
                onClick={handleAssignSubmit}
                disabled={assigning || !assignEngineerId || !assignVisitDate}
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ══ SIDE DRAWER ══════════════════════════════════════════════════ */}
      {selectedDrawerApp && (
        <div className="cr-drawer-overlay" onClick={() => setSelectedDrawerApp(null)}>
          <div className="cr-drawer" onClick={e => e.stopPropagation()}>
            <div className="cr-drawer-header">
              <h3>Application {selectedDrawerApp.applicationId || selectedDrawerApp._id.slice(-8)}</h3>
              <button className="cr-drawer-close" onClick={() => setSelectedDrawerApp(null)}>✕</button>
            </div>
            
            <div className="cr-drawer-body">
              {/* Application Summary & Status */}
              <div className="cr-drawer-section">
                <h4>Status & Timeline</h4>
                <div className="cr-drawer-grid">
                  <div><strong>Current Status:</strong> <span className={`cr-badge ${badgeClass(selectedDrawerApp.status)}`}>{selectedDrawerApp.status}</span></div>
                  <div><strong>Submission Date:</strong> {fmtDate(selectedDrawerApp.createdAt)}</div>
                  {selectedDrawerApp.decisionDate && <div><strong>Decision Date:</strong> {fmtDate(selectedDrawerApp.decisionDate)}</div>}
                  {selectedDrawerApp.visitDate && <div><strong>Scheduled Visit:</strong> {fmtDate(selectedDrawerApp.visitDate)}</div>}
                </div>
              </div>

              {/* Applicant Details */}
              <div className="cr-drawer-section">
                <h4>Applicant Information</h4>
                <div className="cr-drawer-grid">
                  <div><strong>Name:</strong> {selectedDrawerApp.fullName}</div>
                  <div><strong>Email:</strong> {selectedDrawerApp.email}</div>
                  <div><strong>Contact:</strong> {selectedDrawerApp.contact}</div>
                  {selectedDrawerApp.meterNumber && <div><strong>Consumer No:</strong> {selectedDrawerApp.meterNumber}</div>}
                </div>
              </div>
              
              {/* Connection Information */}
              <div className="cr-drawer-section">
                <h4>Connection & Address</h4>
                <div className="cr-drawer-grid">
                  <div><strong>Connection Type:</strong> {selectedDrawerApp.userType}</div>
                  <div><strong>Load (kW):</strong> {selectedDrawerApp.load}</div>
                  <div><strong>Meter Type:</strong> {selectedDrawerApp.meterType}</div>
                  <div><strong>Pincode:</strong> {selectedDrawerApp.pincode}</div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Full Address:</strong> {selectedDrawerApp.address}
                </div>
              </div>
              
              {/* Uploaded Documents */}
              <div className="cr-drawer-section">
                <h4>Uploaded Documents</h4>
                {(!selectedDrawerApp.documents || selectedDrawerApp.documents.length === 0) ? (
                  <p className="cr-drawer-empty-text">No documents uploaded.</p>
                ) : (
                  <div className="cr-doc-list">
                    {selectedDrawerApp.documents.map((docUrl, i) => {
                      const docName = i === 0 ? 'Aadhaar / ID Proof' : (i === 1 ? 'Property Proof' : `Document ${i+1}`);
                      const isPdf = docUrl.toLowerCase().endsWith('.pdf');
                      const docType = isPdf ? 'PDF' : 'Image';
                      
                      return (
                        <div key={i} className="cr-doc-item">
                          <div className="cr-doc-info">
                            <span className="cr-doc-icon">{isPdf ? '📄' : '🖼️'}</span>
                            <div className="cr-doc-name">{docName}</div>
                            <div className="cr-doc-type">{docType}</div>
                          </div>
                          <div className="cr-doc-actions">
                            <button 
                              className="cr-btn cr-btn--preview"
                              onClick={() => setPreviewDoc({ url: docUrl, type: docType, name: docName })}
                            >
                              Preview
                            </button>
                            <a 
                              href={`http://localhost:5000/${docUrl}`} 
                              download 
                              target="_blank" 
                              rel="noreferrer"
                              className="cr-btn cr-btn--secondary"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Admin Remarks */}
              {selectedDrawerApp.installationRemarks && (
                 <div className="cr-drawer-section">
                   <h4>Admin / Installation Remarks</h4>
                   <p className="cr-drawer-remarks">{selectedDrawerApp.installationRemarks}</p>
                 </div>
              )}
              
              {/* Action Buttons */}
              <div className="cr-drawer-section cr-drawer-actions">
                 {selectedDrawerApp.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="cr-btn cr-btn--approve" onClick={() => setApproveModal(selectedDrawerApp)}>Approve Application</button>
                      <button className="cr-btn cr-btn--reject" onClick={() => setRejectModal(selectedDrawerApp)}>Reject Application</button>
                    </div>
                 )}
                 {selectedDrawerApp.status === 'Approved' && (
                    <div>
                      <button className="cr-btn cr-btn--assign-modal" onClick={() => {
                        setAssignEngineerId('');
                        setAssignVisitDate('');
                        setAssignRemarks('');
                        setAssignModal(selectedDrawerApp);
                      }}>Assign Engineer</button>
                    </div>
                 )}
              </div>

            </div>
          </div>
        </div>
      )}
      
      {/* ══ DOCUMENT PREVIEW MODAL ═════════════════════════════════════ */}
      {previewDoc && (
        <div className="cr-doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
           <div className="cr-doc-modal" onClick={e => e.stopPropagation()}>
              <div className="cr-doc-modal-header">
                <h3>Preview: {previewDoc.name}</h3>
                <button className="cr-modal-close" onClick={() => setPreviewDoc(null)}>✕</button>
              </div>
              <div className="cr-doc-modal-body">
                 {previewDoc.type === 'PDF' ? (
                    <iframe 
                      src={`http://localhost:5000/${previewDoc.url}`} 
                      title={previewDoc.name}
                      className="cr-doc-iframe"
                    />
                 ) : (
                    <img 
                      src={`http://localhost:5000/${previewDoc.url}`} 
                      alt={previewDoc.name} 
                      className="cr-doc-img" 
                      onError={(e) => { e.target.src = ''; e.target.alt = 'Image failed to load'; }}
                    />
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ConnectionRequests;