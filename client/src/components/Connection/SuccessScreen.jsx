import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Connection.css';

const SuccessScreen = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/application-tracker');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="conn-success-screen">
      <div className="conn-success-icon">
        <Check size={32} />
      </div>
      <h3>Application Submitted Successfully</h3>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
        Your request for a new electricity connection has been received and is currently under review.
      </p>

      <div className="conn-success-details">
        <p>Application ID: <strong>Pending Generation</strong></p>
        <p>Estimated Review Time: <strong>2-3 Business Days</strong></p>
        <p>Current Status: <strong style={{ color: '#F59E0B' }}>Pending Verification</strong></p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className="conn-btn-back" 
          onClick={() => navigate('/homepage')}
        >
          Return Dashboard
        </button>
        <button 
          className="conn-btn-next" 
          onClick={() => navigate('/application-tracker')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Track Application <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
