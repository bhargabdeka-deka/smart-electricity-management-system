import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './KycReviewPanel.css';

const KycReviewPanel = () => {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.token && user?.role === 'admin') {
      fetchKycSubmissions();
    }
    // eslint-disable-next-line
  }, []);

  const fetchKycSubmissions = async () => {
    try {
      const res = await axios.get('/api/admin/kyc-requests', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('📥 Fetched KYC Data:', res.data);
      setKycList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || '❗ Failed to fetch KYC requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (kycId, status, remarks) => {
    try {
      await axios.put(`/api/admin/kyc-status/${kycId}`, { status, remarks }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(`KYC ${status} successfully!`);
      fetchKycSubmissions();
    } catch (err) {
      toast.error('Failed to update KYC status. Server error occurred.');
      console.error(err);
    }
  };

  return (
    <div className="kyc-panel-container">
      <h2>📄 KYC Review Dashboard</h2>

      {loading ? (
        <p>🔄 Loading submissions...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : kycList.length === 0 ? (
        <p>✅ No pending KYC submissions.</p>
      ) : (
        kycList.map((entry) => (
          <div key={entry._id} className="kyc-card">
            <p><strong>User:</strong> {entry.fullName}</p>
            <p><strong>Meter Number:</strong> {entry.meterNumber}</p>
            <p><strong>Status:</strong> <span className={`status-${entry.kycStatus}`}>{entry.kycStatus}</span></p>
            <p><strong>Aadhaar Number:</strong> {entry.aadhaarNumber}</p>
            <p><strong>PAN Number:</strong> {entry.panNumber}</p>

            <div className="kyc-files">
              <p>
                <strong>Aadhaar:</strong>{' '}
                {entry.docs?.aadhaar && (
                  <a
                    href={`http://localhost:5000/${entry.docs.aadhaar}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔎 View
                  </a>
                )}
              </p>
              <p>
                <strong>Proof of Ownership:</strong>{' '}
                {entry.docs?.proof && (
                  <a
                    href={`http://localhost:5000/${entry.docs.proof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔎 View
                  </a>
                )}
              </p>
            </div>

            {entry.kycStatus === 'Pending' && (
              <div className="kyc-actions">
                <textarea
                  placeholder="💬 Add remarks"
                  rows={2}
                  onChange={(e) => entry._remarks = e.target.value}
                />
                <div className="kyc-buttons">
                  <button onClick={() => handleDecision(entry._id, 'Approved', entry._remarks)}>✅ Approve</button>
                  <button onClick={() => handleDecision(entry._id, 'Rejected', entry._remarks)}>❌ Reject</button>
                </div>
              </div>
            )}

            {entry.decisionDate && (
              <p><strong>Reviewed:</strong> {new Date(entry.decisionDate).toLocaleDateString()}</p>
            )}
            {entry.adminRemarks && (
              <p><strong>Remarks:</strong> {entry.adminRemarks}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default KycReviewPanel;