import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConnectionLayout from './ConnectionLayout';
import ConnectionCard from './ConnectionCard';
import DocumentUploader from './DocumentUploader';
import ReviewCard from './ReviewCard';
import SuccessScreen from './SuccessScreen';
import { LoadingButton } from '../Common';

export default function ConnectionStepper() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    contact: '',
    userType: '',
    address: '',
    pincode: '',
    load: '',
    meterType: '',
    visitDate: '',
    meterNumber: '',
    aadhaar: null,
    proof: null
  });

  // 1. Auto-save & Local Storage Load
  useEffect(() => {
    const saved = localStorage.getItem('connectionFormData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // We do not restore file objects from JSON string
        setFormData(prev => ({ ...prev, ...parsed, aadhaar: null, proof: null }));
      } catch (err) {}
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.meterNumber) {
          setFormData((prev) => ({ ...prev, meterNumber: parsed.meterNumber }));
        }
      } catch (err) {}
    }
  }, []);

  useEffect(() => {
    // Autosave stringifiable fields
    const { aadhaar, proof, ...rest } = formData;
    localStorage.setItem('connectionFormData', JSON.stringify(rest));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.contact || !formData.userType) {
        return toast.warning('Please complete all fields in this step.');
      }
    } else if (step === 2) {
      if (!formData.address || !formData.pincode || !formData.meterNumber) {
        return toast.warning('Please complete all required fields.');
      }
    } else if (step === 3) {
      if (!formData.aadhaar || !formData.proof) {
        return toast.warning('Please upload all required documents.');
      }
    }
    setStep(s => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast.error('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    let token = '';
    try {
      token = JSON.parse(storedUser)?.token;
      if (!token) throw new Error('Token missing');
    } catch (err) {
      toast.error('Invalid session. Please log in again.');
      setLoading(false);
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      // Skip load and meterType from standard iteration since they are no longer in the UI
      if (key === 'load' || key === 'meterType') return;
      if (val !== null && val !== undefined) {
        fd.append(key, val);
      }
    });

    // Inject temporary values for backend schema validation
    // These will be properly determined by the Field Engineer later
    fd.append('load', 0);
    fd.append('meterType', 'Pending Inspection');

    try {
      await axios.post('/api/connections', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        timeout: 7000
      });
      // Success
      localStorage.removeItem('connectionFormData'); // clear autosave
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <ConnectionLayout currentStep={4} isSuccess={true}>
        <SuccessScreen />
      </ConnectionLayout>
    );
  }

  return (
    <ConnectionLayout currentStep={step} isSuccess={false}>
      {/* STEP 1: Applicant Information */}
      {step === 1 && (
        <ConnectionCard title="Applicant Information">
          <div className="conn-form-grid">
            <div className="conn-form-group">
              <label className="conn-form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
              <input 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                className="conn-form-input" 
                placeholder="Enter full name"
              />
            </div>
            <div className="conn-form-group">
              <label className="conn-form-label">Phone <span style={{ color: 'red' }}>*</span></label>
              <input 
                name="contact" 
                value={formData.contact} 
                onChange={handleChange} 
                className="conn-form-input" 
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="conn-form-group">
              <label className="conn-form-label">Consumer Type <span style={{ color: 'red' }}>*</span></label>
              <select 
                name="userType" 
                value={formData.userType} 
                onChange={handleChange} 
                className="conn-form-select"
              >
                <option value="">Select...</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>
          <div className="conn-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="conn-btn-next" onClick={nextStep}>Next Step ➡️</button>
          </div>
        </ConnectionCard>
      )}

      {/* STEP 2: Address Details */}
      {step === 2 && (
        <ConnectionCard title="Address Details">
          <div className="conn-form-grid">
            <div className="conn-form-group full">
              <label className="conn-form-label">Full Address <span style={{ color: 'red' }}>*</span></label>
              <input 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className="conn-form-input" 
                placeholder="House Number, Street, Village/City"
              />
            </div>
            <div className="conn-form-group">
              <label className="conn-form-label">PIN Code <span style={{ color: 'red' }}>*</span></label>
              <input 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleChange} 
                className="conn-form-input" 
                placeholder="6-digit PIN"
              />
            </div>
          </div>
          
          <h4 style={{ margin: '2rem 0 1rem 0', color: '#111827', fontSize: 'var(--text-h4)' }}>Connection Details</h4>
          <div className="conn-form-grid">
            {/* Load Requirement and Meter Type fields have been removed.
                These will be determined by the Field Engineer during physical site inspection. */}
            <div className="conn-form-group">
              <label className="conn-form-label">Account Number <span style={{ color: 'red' }}>*</span></label>
              <input 
                name="meterNumber" 
                type="text"
                value={formData.meterNumber} 
                onChange={handleChange} 
                className="conn-form-input" 
                placeholder="12-digit number"
                readOnly
              />
            </div>
            <div className="conn-form-group">
              <label className="conn-form-label">Preferred Visit Date (Optional)</label>
              <input 
                name="visitDate" 
                type="date"
                value={formData.visitDate} 
                onChange={handleChange} 
                className="conn-form-input" 
              />
            </div>
          </div>
          
          <div className="conn-actions">
            <button className="conn-btn-back" onClick={prevStep}>⬅️ Back</button>
            <button className="conn-btn-next" onClick={nextStep}>Next Step ➡️</button>
          </div>
        </ConnectionCard>
      )}

      {/* STEP 3: Document Upload */}
      {step === 3 && (
        <ConnectionCard title="Document Upload">
          <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: 'var(--text-small)' }}>
            Please upload clear, legible copies of the following documents. Allowed formats: PDF, JPG, PNG (Max 5MB).
          </p>
          <div className="conn-form-grid">
            <DocumentUploader 
              label="Aadhaar Card *" 
              name="aadhaar" 
              accept=".pdf,image/*"
              file={formData.aadhaar} 
              onChange={handleFile}
              subtext="Front and Back merged in one file"
            />
            <DocumentUploader 
              label="Address / Ownership Proof *" 
              name="proof" 
              accept=".pdf,image/*"
              file={formData.proof} 
              onChange={handleFile}
              subtext="Electricity Bill, Property Tax, or Rent Agreement"
            />
          </div>
          
          <div className="conn-actions">
            <button className="conn-btn-back" onClick={prevStep}>⬅️ Back</button>
            <button className="conn-btn-next" onClick={nextStep}>Review Application ➡️</button>
          </div>
        </ConnectionCard>
      )}

      {/* STEP 4: Review & Submit */}
      {step === 4 && (
        <>
          <ReviewCard formData={formData} setStep={setStep} />
          <div className="conn-actions">
            <button className="conn-btn-back" onClick={prevStep}>⬅️ Back</button>
            <LoadingButton 
              className="conn-btn-next" 
              onClick={handleSubmit} 
              isLoading={loading}
              loadingText="Submitting..."
            >
              Confirm & Submit
            </LoadingButton>
          </div>
        </>
      )}
    </ConnectionLayout>
  );
}
