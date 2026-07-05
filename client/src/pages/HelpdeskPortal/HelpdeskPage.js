import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LoadingButton } from '../../components/Common';
import { useLifecycle } from '../../hooks/useLifecycle';
import './HelpdeskPage.css';
import ComplaintCard from './ComplaintCard';
import FeedbackForm from './FeedbackForm';

export default function HelpdeskPage() {
  // Grab token (we don’t need to send meterNumber—server reads it from the JWT)
  const { token } = JSON.parse(localStorage.getItem('user')) || {};

  const [issueText, setIssueText]           = useState('');
  const [issueType, setIssueType]           = useState('');
  const [ticketData, setTicketData]         = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [submitting, setSubmitting]         = useState(false);

  const { config } = useLifecycle(connectionStatus);
  const allowedCategories = config?.helpdeskCategories || [];

  // Set auth header once, and load ticket
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchTicket();
      fetchConnectionStatus();
    }
  }, [token]);

  const fetchConnectionStatus = async () => {
    try {
      const res = await axios.get('/api/connections/my-request');
      setConnectionStatus(res.data);
    } catch (err) {
      console.error('Error fetching connection status');
    }
  };

  // Fetch the user’s latest ticket
  const fetchTicket = async () => {
    try {
      const res = await axios.get('/api/users/helpdesk');
      const ticket = res.data;
      setTicketData(ticket);

      // Only show feedback form if adminReply.text exists and no feedback yet
      const needsFeedback = ticket?.adminReply?.text && !ticket.feedback;
      setShowFeedbackForm(needsFeedback);
    } catch (err) {
      console.error(
        '❌ Ticket fetch error:',
        err.response?.data?.message || err.message
      );
    }
  };

  // Submit a new complaint
  const submitTicket = async () => {
    if (!issueType) {
      return toast.warning('Please select a category.');
    }
    if (!issueText.trim()) {
      return toast.warning('Please describe your issue before submitting.');
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/users/helpdesk', { issueType, issueText });
      console.log('✅ Ticket created:', res.data);
      toast.success('Complaint submitted successfully.');
      setIssueText('');
      setIssueType('');
      fetchTicket();
    } catch (err) {
      console.error(
        '❌ Ticket submit error:',
        err.response?.data?.message || err.message
      );
      toast.error(err.response?.data?.message || 'Could not submit your request. Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="helpdesk-container">
      <h2>📩 APDCL Helpdesk</h2>

      {/* Status badge */}
      {ticketData && (
        <p className={`status-chip ${ticketData.status === 'Pending' ? 'waiting' : ''}`}>
          <strong>Status:</strong> {ticketData.status}
        </p>
      )}

      {/* New complaint input */}
      <textarea
        placeholder="Describe your complaint or issue…"
        value={issueText}
        onChange={e => setIssueText(e.target.value)}
      />
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option value="">-- Select Issue Type --</option>
              {allowedCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
      <LoadingButton 
        isLoading={submitting} 
        loadingText="Submitting..." 
        onClick={submitTicket}
        style={{ marginTop: '1rem', marginBottom: '2rem' }}
      >
        Send Request
      </LoadingButton>

      {/* Existing complaint & reply */}
      {ticketData ? (
        <ComplaintCard ticket={ticketData} />
      ) : (
        <p className="pending-note">🕒 No complaint found yet</p>
      )}

      {/* Feedback form (after a real adminReply.text) */}
      {showFeedbackForm && (
        <FeedbackForm
          onFeedbackSubmitted={() => {
            setShowFeedbackForm(false);
            fetchTicket();
          }}
        />
      )}
    </div>
  );
}