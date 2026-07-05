import React from 'react';
import ConnectionCard from './ConnectionCard';
import './Connection.css';

const ReviewCard = ({ formData, setStep }) => {
  return (
    <div>
      <ConnectionCard title="Review Application Details">
        <div className="conn-form-grid" style={{ marginBottom: '2rem' }}>
          <div className="conn-form-group">
            <span className="conn-form-label">Full Name</span>
            <span>{formData.fullName}</span>
          </div>
          <div className="conn-form-group">
            <span className="conn-form-label">Phone</span>
            <span>{formData.contact}</span>
          </div>
          <div className="conn-form-group">
            <span className="conn-form-label">Consumer Type</span>
            <span>{formData.userType}</span>
          </div>
        </div>

        <h4 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Address Details</h4>
        <div className="conn-form-grid" style={{ marginBottom: '2rem' }}>
          <div className="conn-form-group">
            <span className="conn-form-label">Address</span>
            <span>{formData.address}</span>
          </div>
          <div className="conn-form-group">
            <span className="conn-form-label">PIN Code</span>
            <span>{formData.pincode}</span>
          </div>
        </div>

        <h4 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Connection Details</h4>
        <div className="conn-form-grid" style={{ marginBottom: '2rem' }}>
          <div className="conn-form-group">
            <span className="conn-form-label">Technical Parameters</span>
            <span style={{ fontStyle: 'italic', color: '#6B7280' }}>To be determined by Field Engineer</span>
          </div>
          {formData.visitDate && (
            <div className="conn-form-group">
              <span className="conn-form-label">Preferred Visit Date</span>
              <span>{formData.visitDate}</span>
            </div>
          )}
        </div>

        <h4 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Uploaded Documents</h4>
        <div className="conn-form-grid">
          <div className="conn-form-group">
            <span className="conn-form-label">Aadhaar</span>
            <span>{formData.aadhaar?.name || 'Not uploaded'}</span>
          </div>
          <div className="conn-form-group">
            <span className="conn-form-label">Address Proof</span>
            <span>{formData.proof?.name || 'Not uploaded'}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button type="button" className="conn-btn-back" style={{ border: 'none', background: 'none', color: '#005BAC', padding: 0 }} onClick={() => setStep(1)}>
            Edit Details
          </button>
        </div>
      </ConnectionCard>
    </div>
  );
};

export default ReviewCard;
