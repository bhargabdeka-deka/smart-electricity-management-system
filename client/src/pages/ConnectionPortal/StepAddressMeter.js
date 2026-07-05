// src/ConnectionPortal/StepAddressMeter.js

import React from 'react';
import './StepAddressMeter.css';

export default function StepAddressMeter({ formData, setFormData, next, prev }) {
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="step-address-meter">
      <input
        name="address"
        value={formData.address || ''}
        onChange={handleChange}
        placeholder="🏠 Address"
        required
      />

      <input
        name="pincode"
        value={formData.pincode || ''}
        onChange={handleChange}
        placeholder="📮 Pincode"
        required
      />

      {/* Load and Meter Type have been removed from the UI per the new workflow. */}

      {/* Visit Date Field with Placeholder Overlay */}
      <div className="date-input-wrapper">
        <input
          name="visitDate"
          type="date"
          className="date-input"
          value={formData.visitDate || ''}
          onChange={handleChange}
          required
        />
        {!formData.visitDate && (
          <span className="date-input-placeholder">
            dd-mm-yyyy (Visit Date)
          </span>
        )}
      </div>

      <input
        name="meterNumber"
        type="text"
        value={formData.meterNumber || ''}
        onChange={handleChange}
        placeholder="🔢 Meter Number"
        required
      />

      <div className="step-buttons">
        <button type="button" onClick={prev}>⬅️ Back</button>
        <button type="button" onClick={next}>➡️ Next</button>
      </div>
    </div>
  );
}