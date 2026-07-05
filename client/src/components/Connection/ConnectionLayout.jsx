import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ConnectionLayout = ({ children, currentStep, isSuccess }) => {
  const navigate = useNavigate();

  const steps = [
    { id: 1, label: 'Applicant Details' },
    { id: 2, label: 'Address Information' },
    { id: 3, label: 'Document Upload' },
    { id: 4, label: 'Review & Submit' }
  ];

  return (
    <div className="conn-stepper-wrapper">
      <div className="conn-header">
        <div className="conn-breadcrumb">
          <Link to="/homepage" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link> 
          <ChevronRight size={14} style={{ margin: '0 0.5rem', display: 'inline', verticalAlign: 'middle' }} /> 
          <span>New Connection</span>
        </div>
        <h2>New Electricity Connection</h2>
        <p>Apply for a new residential or commercial electricity connection.</p>
      </div>

      {!isSuccess && (
        <div className="conn-progress">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`conn-step-indicator ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
            >
              <div className="conn-step-circle">
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div className="conn-step-label">{step.label}</div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

export default ConnectionLayout;
