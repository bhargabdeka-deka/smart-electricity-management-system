import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './HelpdeskTicketsPage.css';

const ROWS_PER_PAGE = 10;

export default function HelpdeskTicketsPage() {
  const user    = JSON.parse(localStorage.getItem('user'));
  const headers = { Authorization: `Bearer ${user?.token}` };

  const [tickets,    setTickets]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);

  // Expanded row state
  const [expandedId, setExpandedId] = useState(null);
  const [replyMap,   setReplyMap]   = useState({});
  const [sending,    setSending]    = useState({});
  const [closing,    setClosing]    = useState({});

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/tickets', { headers });
      setTickets(res.data);
    } catch (err) {
      console.error('Tickets fetch error:', err);
      toast.error('Failed to load tickets.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
    fetchTickets();
  }, [fetchTickets]);

  // ── Reply ────────────────────────────────────────────────────────────────
  const sendReply = async (ticketId) => {
    const text = replyMap[ticketId]?.trim();
    if (!text) return toast.warning('Please enter a reply.');
    setSending(prev => ({ ...prev, [ticketId]: true }));
    try {
      await axios.put(`/api/admin/tickets/${ticketId}/reply`, { reply: text });
      toast.success('Reply sent!');
      setReplyMap(prev => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
    } catch {
      toast.error('Failed to send reply.');
    } finally {
      setSending(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  // ── Close Ticket ─────────────────────────────────────────────────────────
  const closeTicket = async (ticketId) => {
    setClosing(prev => ({ ...prev, [ticketId]: true }));
    try {
      await axios.put(`/api/admin/tickets/${ticketId}/close`);
      toast.success('Ticket marked as Resolved.');
      fetchTickets();
    } catch {
      toast.error('Failed to close ticket.');
    } finally {
      setClosing(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = tickets.filter(t => {
    const q    = search.toLowerCase();
    const user = t.user;
    const matchSearch =
      !search ||
      t.meterNumber?.toLowerCase().includes(q) ||
      t.issueText?.toLowerCase().includes(q)   ||
      user?.name?.toLowerCase().includes(q)    ||
      t._id?.slice(-6).toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  useEffect(() => setPage(1), [search, filterStatus]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const badgeClass = (s) => {
    if (s === 'Pending')  return 'hd-badge--pending';
    if (s === 'Replied')  return 'hd-badge--replied';
    if (s === 'Resolved') return 'hd-badge--resolved';
    return 'hd-badge--pending';
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const summaryStats = {
    total:    tickets.length,
    pending:  tickets.filter(t => t.status === 'Pending').length,
    replied:  tickets.filter(t => t.status === 'Replied').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div className="hd-root">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="hd-page-header">
        <div>
          <h1 className="hd-page-title">Helpdesk Tickets</h1>
          <p className="hd-page-sub">
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
            {search || filterStatus ? ' (filtered)' : ' total'}
          </p>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────────── */}
      <div className="hd-stats-row">
        <div className="hd-stat hd-stat--gray">
          <span className="hd-stat-val">{summaryStats.total}</span>
          <span className="hd-stat-label">Total</span>
        </div>
        <div className="hd-stat hd-stat--amber">
          <span className="hd-stat-val">{summaryStats.pending}</span>
          <span className="hd-stat-label">Pending</span>
        </div>
        <div className="hd-stat hd-stat--blue">
          <span className="hd-stat-val">{summaryStats.replied}</span>
          <span className="hd-stat-label">Replied</span>
        </div>
        <div className="hd-stat hd-stat--green">
          <span className="hd-stat-val">{summaryStats.resolved}</span>
          <span className="hd-stat-label">Resolved</span>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="hd-filters">
        <div className="hd-search-wrap">
          <span className="hd-search-icon">🔍</span>
          <input
            className="hd-search"
            placeholder="Search by ID, meter, customer, issue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="hd-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        <select
          className="hd-filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Replied">Replied</option>
          <option value="Resolved">Resolved</option>
        </select>

        {(search || filterStatus) && (
          <button
            className="hd-clear-all"
            onClick={() => { setSearch(''); setFilterStatus(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────── */}
      <div className="hd-card">
        {loading ? (
          <div className="hd-loading">
            <div className="hd-spinner" />
            <span>Loading tickets…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="hd-empty">
            <span>📭</span>
            <p>No tickets match your search.</p>
          </div>
        ) : (
          <div className="hd-table-wrap">
            <table className="hd-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Meter No.</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((ticket, idx) => {
                  const rowNum    = (page - 1) * ROWS_PER_PAGE + idx + 1;
                  const isExpanded = expandedId === ticket._id;
                  const userLabel  = ticket.user?.name || 'Unknown';
                  const shortId    = ticket._id?.slice(-6).toUpperCase();

                  return (
                    <React.Fragment key={ticket._id}>
                      <tr
                        className={`hd-row ${isExpanded ? 'hd-row--active' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                      >
                        <td className="hd-td-num">{rowNum}</td>
                        <td className="hd-td-id">#{shortId}</td>
                        <td className="hd-td-name">
                          <div className="hd-cust-name">{userLabel}</div>
                        </td>
                        <td className="hd-td-meter">{ticket.meterNumber}</td>
                        <td className="hd-td-issue">
                          <span className="hd-issue-text" title={ticket.issueText}>
                            {ticket.issueText}
                          </span>
                        </td>
                        <td>
                          <span className={`hd-badge ${badgeClass(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{fmtDate(ticket.createdAt)}</td>
                        <td>
                          <div className="hd-actions" onClick={e => e.stopPropagation()}>
                            <button
                              className="hd-btn hd-btn--expand"
                              onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                            >
                              {isExpanded ? '▲ Collapse' : '▼ Expand'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded Row ──────────────────────────────── */}
                      {isExpanded && (
                        <tr className="hd-expanded-row">
                          <td colSpan={8}>
                            <div className="hd-expanded-body">

                              {/* Full Issue */}
                              <div className="hd-thread-section">
                                <div className="hd-thread-label">📣 Customer Issue</div>
                                <div className="hd-thread-bubble hd-thread-bubble--customer">
                                  <p>{ticket.issueText}</p>
                                  <small>{fmtDateTime(ticket.createdAt)}</small>
                                </div>
                              </div>

                              {/* Admin Reply (if exists) */}
                              {ticket.adminReply?.text && (
                                <div className="hd-thread-section">
                                  <div className="hd-thread-label">💬 Admin Reply</div>
                                  <div className="hd-thread-bubble hd-thread-bubble--admin">
                                    <p>{ticket.adminReply.text}</p>
                                    <small>{fmtDateTime(ticket.adminReply.replyTime)}</small>
                                  </div>
                                </div>
                              )}

                              {/* Reply / Close Controls */}
                              {ticket.status !== 'Resolved' && (
                                <div className="hd-reply-section">
                                  <div className="hd-thread-label">✏️ Reply to Customer</div>
                                  <textarea
                                    className="hd-reply-textarea"
                                    value={replyMap[ticket._id] || ''}
                                    onChange={e =>
                                      setReplyMap(prev => ({
                                        ...prev,
                                        [ticket._id]: e.target.value
                                      }))
                                    }
                                    placeholder="Type your reply here…"
                                    rows={3}
                                  />
                                  <div className="hd-reply-footer">
                                    <button
                                      className="hd-btn hd-btn--close"
                                      disabled={closing[ticket._id]}
                                      onClick={() => closeTicket(ticket._id)}
                                    >
                                      {closing[ticket._id] ? 'Closing…' : '✔️ Mark Resolved'}
                                    </button>
                                    <button
                                      className="hd-btn hd-btn--send"
                                      disabled={!replyMap[ticket._id]?.trim() || sending[ticket._id]}
                                      onClick={() => sendReply(ticket._id)}
                                    >
                                      {sending[ticket._id] ? 'Sending…' : '📤 Send Reply'}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {ticket.status === 'Resolved' && (
                                <div className="hd-resolved-notice">
                                  ✅ This ticket is resolved.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {!loading && filtered.length > ROWS_PER_PAGE && (
          <div className="hd-pagination">
            <span className="hd-page-info">
              {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="hd-page-btns">
              <button className="hd-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`hd-page-btn ${page === p ? 'hd-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button className="hd-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}