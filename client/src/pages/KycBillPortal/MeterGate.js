// src/pages/KycBillPortal/MeterGate.js
import React, { useState, useEffect } from 'react';
import './KycBillPortal.css';

export default function MeterGate({ onSubmit }) {
  const [meter, setMeter] = useState('');
  const [error, setError] = useState('');

  // Autofill from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.meterNumber) {
      setMeter(user.meterNumber);
      onSubmit(user.meterNumber); // Optional: auto-trigger submission
    }
  }, [onSubmit]);

  const handleSubmit = e => {
    e.preventDefault();
    const trimmed = meter.trim();
    if (!trimmed) {
      setError('❌ Meter number is required.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <form className="meter-gate" onSubmit={handleSubmit}>
      <h3>Enter Account Number</h3>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
        Please enter your APDCL Account Number to proceed with KYC/Billing verification.
      </p>
      <input
        id="meter-number"
        type="text"
        className="input-field"
        placeholder="Account Number"
        value={meter}
        onChange={e => setMeter(e.target.value)}
      />
      <button type="submit" disabled={!meter.trim()}>
        Load My Portal
      </button>
      {error && <p className="meter-error">{error}</p>}
    </form>
  );
}