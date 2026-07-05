import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './Common.css';

const SuccessMessage = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`common-success-message ${className}`} aria-live="polite" role="status">
      <CheckCircle2 size={18} className="common-success-icon" />
      <span>{message}</span>
    </div>
  );
};

export default SuccessMessage;
